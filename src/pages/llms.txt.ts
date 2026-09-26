import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';
import { canonicalUrl, paths } from '../lib/urls';

/**
 * llms.txt (https://llmstxt.org): a plain-text map of the site for AI
 * answer engines, so they can find and cite the right page.
 */
export const GET: APIRoute = async () => {
  const [cities, radios, tvs, guides] = await Promise.all([
    getCollection('cities'),
    getCollection('radio-stations'),
    getCollection('television-channels'),
    getCollection('guides'),
  ]);
  const national = radios.map((e) => e.data).filter((r) => r.coverageType === 'national').sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  const nationalTv = tvs.map((e) => e.data).filter((t) => t.coverageType === 'national').sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  const lines = [
    `# ${siteConfig.siteName}`,
    '',
    `> Türkiye'deki tüm lisanslı radyo ve televizyon yayınlarının frekans rehberi. ${cities.length} ilde ${radios.length} radyonun FM frekansları ve ${tvs.length} televizyon kanalının dijital karasal (DVB-T2) yayın kanalları; kaynak: RTÜK resmî il bazlı yayın lisans listeleri. Her radyo/kanal için künye (lisans sahibi kuruluş, merkez, kapsama) ve resmî canlı yayın bağlantısı bulunur. Site yayın akışı barındırmaz.`,
    '',
    'Önemli: Bir radyonun FM frekansı ve bir TV kanalının karasal yayın kanalı ilden ile değişir. Soruyu cevaplarken ilgili il sayfasını veya radyo×il sayfasını kaynak gösterin.',
    '',
    '## Ana bölümler',
    `- [Şehre göre radyo frekansları](${canonicalUrl(paths.radioList())}): 81 ilin FM ve karasal TV listeleri`,
    `- [Tüm radyolar A–Z](${canonicalUrl(paths.radioDirectory())})`,
    `- [Televizyon kanalları](${canonicalUrl(paths.tvList())})`,
    `- [Karasal TV frekansları (DVB-T2)](${canonicalUrl(paths.tvFrequencies())})`,
    `- [Yayın kuruluşları (firma profilleri)](${canonicalUrl(paths.broadcasterList())})`,
    `- [Uydu bilgileri](${canonicalUrl(paths.satelliteList())})`,
    `- [Veri kaynakları ve doğrulama](${canonicalUrl(paths.dataSources())})`,
    '',
    '## URL kalıpları',
    `- İl sayfası: ${canonicalUrl('/radyo-frekanslari/{il}/')} (ör. ${canonicalUrl(paths.city('istanbul'))})`,
    `- Radyo profili: ${canonicalUrl('/radyo/{radyo}/')}`,
    `- Radyonun bir ildeki frekansı: ${canonicalUrl('/radyo/{radyo}/{il}/')}`,
    `- TV kanalı profili: ${canonicalUrl('/tv/{kanal}/')}`,
    `- Belirli bir FM frekansında yayın yapan radyolar: ${canonicalUrl('/frekans/{deger}/')}`,
    '',
    '## Ulusal radyolar',
    ...national.map((r) => `- [${r.name}](${canonicalUrl(paths.radioStation(r.slug))})`),
    '',
    '## Ulusal televizyon kanalları',
    ...nationalTv.map((t) => `- [${t.name}](${canonicalUrl(paths.televisionChannel(t.slug))})`),
    '',
    '## İller',
    ...cities
      .map((e) => e.data)
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
      .map((c) => `- [${c.name} radyo frekansları](${canonicalUrl(paths.city(c.slug))})`),
    '',
    '## Rehberler',
    ...guides.map((g) => `- [${g.data.title}](${canonicalUrl(paths.guide(g.id))}): ${g.data.description}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
