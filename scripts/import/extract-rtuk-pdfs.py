#!/usr/bin/env python3
"""RTÜK "il bazında yayın lisans listesi" PDF -> flat JSON extractor.

RTÜK (Radyo ve Televizyon Üst Kurulu) publishes one PDF per province per
broadcast kind ("<İL>_RADYO.pdf", "<İL>_TV.pdf") listing every licensed
broadcaster's legal name, license tier, brand name, band, frequency/channel
number and transmitter district, plus a "_indirme_ozeti.csv" download
summary with the official province id + proper Turkish spelling for each
file. This script turns a folder of those files into one JSON file that
`scripts/import/build-rtuk-data.ts` maps into this project's normalized
src/data/*.json schema.

Requires PyMuPDF's table-detection API (`pip install pymupdf`) -- there's no
project dependency on it beyond this one offline preprocessing step, so it's
intentionally not part of the Node/TypeScript toolchain.

Usage:
    pip install pymupdf
    python3 scripts/import/extract-rtuk-pdfs.py <klasör> [-o cikti.json]

<klasör> is the directory the RTÜK zip was extracted into (containing the
*_RADYO.pdf / *_TV.pdf files and _indirme_ozeti.csv side by side).
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF


def load_province_map(extracted_dir: Path) -> dict[str, tuple[str, str]]:
    """ASCII filename-stem -> (sehir_id / plaka kodu, proper Turkish name)."""
    summary_path = extracted_dir / "_indirme_ozeti.csv"
    if not summary_path.exists():
        raise SystemExit(f"'_indirme_ozeti.csv' bulunamadı: {summary_path}")
    province_map: dict[str, tuple[str, str]] = {}
    with open(summary_path, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            stem = re.sub(r"_(RADYO|TV)\.pdf$", "", row["file"])
            province_map[stem] = (row["sehir_id"], row["sehir"])
    return province_map


def extract_pdf(pdf_path: Path, province_stem: str, province_name: str, sehir_id: str, kind: str, anomalies: list[str]) -> list[dict]:
    doc = fitz.open(pdf_path)
    records: list[dict] = []
    pending: dict | None = None  # in-progress record awaiting its address continuation row
    row_count = 0

    for page_index, page in enumerate(doc):
        for table in page.find_tables().tables:
            rows = table.extract()
            if not rows:
                continue
            # RTÜK only prints the header ("#", "Ünvanı", ...) on the first
            # page of a multi-page table; later pages start directly with
            # data. Only strip rows[0] when it's actually that header --
            # unconditionally slicing rows[1:] silently drops the first real
            # record of every page after the first.
            is_header_row = bool(rows[0]) and (rows[0][0] or "").strip() == "#"
            data_rows = rows[1:] if is_header_row else rows

            for r in data_rows:
                idx, unvan, lisans, brand, band, kanal, ilce = (r + [None] * 7)[:7]
                is_main_row = idx is not None and str(idx).strip() != ""
                if is_main_row:
                    if pending is not None:
                        # Finalize the previous record here (not right after
                        # its continuation row) so an address that itself
                        # spans more than one continuation row still lands
                        # on one record. Only flag it if it genuinely never
                        # got an address.
                        if not pending["address"]:
                            anomalies.append(f"NO_ADDRESS: {pdf_path.name} row#{pending['row_index']}")
                        records.append(pending)
                    pending = {
                        "province_stem": province_stem,
                        "province_name": province_name,
                        "sehir_id": sehir_id,
                        "kind": kind,
                        "row_index": (idx or "").strip(),
                        "unvan": (unvan or "").strip(),
                        "lisans": (lisans or "").strip(),
                        "brand": (brand or "").strip(),
                        "band": (band or "").strip(),
                        "kanal": (kanal or "").strip(),
                        "ilce": (ilce or "").strip(),
                        "address": "",
                    }
                    row_count += 1
                else:
                    # Continuation row: address text lives in the "Ünvanı" column slot.
                    addr_piece = (unvan or "").strip()
                    if pending is None:
                        anomalies.append(f"ORPHAN_CONTINUATION: {pdf_path.name} page{page_index} addr={addr_piece[:50]!r}")
                        continue
                    if addr_piece:
                        pending["address"] = f"{pending['address']} {addr_piece}".strip() if pending["address"] else addr_piece

    if pending is not None:
        if not pending["address"]:
            anomalies.append(f"NO_ADDRESS: {pdf_path.name} row#{pending['row_index']} (dosya sonu)")
        records.append(pending)

    if row_count == 0:
        anomalies.append(f"EMPTY_FILE: {pdf_path.name}")

    # RTÜK's own "#" column is a plain sequential row counter -- any gap or
    # duplicate in that sequence means a row was mis-parsed.
    seen = [int(rec["row_index"]) for rec in records if rec["row_index"].isdigit()]
    if seen:
        missing = sorted(set(range(min(seen), max(seen) + 1)) - set(seen))
        if missing:
            anomalies.append(f"MISSING_ROW_NUMBERS: {pdf_path.name} {missing}")
        dupes = sorted({i for i in seen if seen.count(i) > 1})
        if dupes:
            anomalies.append(f"DUPLICATE_ROW_NUMBERS: {pdf_path.name} {dupes}")

    return records


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("extracted_dir", type=Path, help="RTÜK zip'inin açıldığı klasör (*.pdf + _indirme_ozeti.csv)")
    parser.add_argument("-o", "--output", type=Path, default=Path("raw_extracted.json"), help="Çıktı JSON dosyası (varsayılan: raw_extracted.json)")
    args = parser.parse_args()

    province_map = load_province_map(args.extracted_dir)
    anomalies: list[str] = []
    records: list[dict] = []

    pdf_files = sorted(args.extracted_dir.glob("*.pdf"))
    print(f"{len(pdf_files)} PDF dosyası işleniyor...", file=sys.stderr)

    for pdf_path in pdf_files:
        match = re.match(r"^(.+)_(RADYO|TV)$", pdf_path.stem)
        if not match:
            anomalies.append(f"UNRECOGNIZED_FILENAME: {pdf_path.name}")
            continue
        province_stem, kind = match.group(1), match.group(2)
        if province_stem not in province_map:
            anomalies.append(f"UNKNOWN_PROVINCE: {pdf_path.name}")
            continue
        sehir_id, province_name = province_map[province_stem]
        records.extend(extract_pdf(pdf_path, province_stem, province_name, sehir_id, kind, anomalies))

    print(f"Toplam kayıt: {len(records)}", file=sys.stderr)
    print(f"Toplam anomali: {len(anomalies)}", file=sys.stderr)
    for anomaly in anomalies[:300]:
        print("  ANOMALİ:", anomaly, file=sys.stderr)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump({"records": records, "anomalies": anomalies}, f, ensure_ascii=False, indent=1)
    print(f"Yazıldı: {args.output}", file=sys.stderr)


if __name__ == "__main__":
    main()
