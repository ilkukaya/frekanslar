/**
 * Turkish display labels for every controlled-vocabulary enum in the data
 * layer. Centralized so the same code (station status, filter chips,
 * table cells, JSON view) always shows the same wording.
 */
import type {
  BroadcastKind,
  BroadcastType,
  ChangeType,
  CoverageType,
  Encryption,
  EntityStatus,
  PlatformType,
  Resolution,
  SourceType,
} from '../data/schemas';

export const COVERAGE_TYPE_LABELS: Record<CoverageType, string> = {
  national: 'Ulusal',
  regional: 'Bölgesel',
  local: 'Yerel',
  international: 'Uluslararası',
};

export const BROADCAST_TYPE_LABELS: Record<BroadcastType, string> = {
  'terrestrial-radio': 'Karasal Radyo (FM)',
  'terrestrial-tv': 'Karasal Televizyon',
  'satellite-radio': 'Uydu Radyo',
  'satellite-tv': 'Uydu Televizyon',
  'cable-radio': 'Kablo Radyo',
  'cable-tv': 'Kablo Televizyon',
  'internet-radio': 'İnternet Radyo',
  'internet-tv': 'İnternet Televizyon',
  shortwave: 'Kısa Dalga',
  dab: 'DAB',
  'dab-plus': 'DAB+',
};

export const BROADCAST_KIND_LABELS: Record<BroadcastKind, string> = {
  radio: 'Radyo',
  tv: 'Televizyon',
};

export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  active: 'Aktif',
  planned: 'Planlanan',
  inactive: 'Aktif Değil',
  discontinued: 'Yayından Kaldırıldı',
};

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  'new-broadcast': 'Yeni yayın',
  'discontinued-broadcast': 'Kapanan yayın',
  'frequency-changed': 'Frekans değişikliği',
  'satellite-changed': 'Uydu değişikliği',
  'transponder-changed': 'Transponder değişikliği',
  'symbol-rate-changed': 'Sembol oranı değişikliği',
  'broken-official-link': 'Bağlantı kontrolü',
  'missing-source': 'Eksik kaynak',
  'stale-verification': 'Yeniden inceleme bekliyor',
  other: 'Diğer güncelleme',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  regulator: 'Resmî Düzenleyici Kurum',
  'satellite-operator': 'Uydu İşletmecisi',
  'broadcaster-official': 'Yayın Kuruluşunun Resmî Kaynağı',
  'verified-social': 'Doğrulanmış Sosyal Medya Hesabı',
  secondary: 'İkincil Kaynak',
  'user-submission': 'Kullanıcı Bildirimi',
  'editorial-placeholder': 'Editöryal Örnek Veri',
};

export const ENCRYPTION_LABELS: Record<Encryption, string> = {
  'free-to-air': 'Şifresiz (Free-to-Air)',
  encrypted: 'Şifreli',
};

export const RESOLUTION_LABELS: Record<Resolution, string> = {
  SD: 'SD',
  HD: 'HD',
  UHD: 'UHD (4K)',
};

export const PLATFORM_TYPE_LABELS: Record<PlatformType, string> = {
  'satellite-pay-tv': 'Ücretli Uydu Televizyon',
  cable: 'Kablo',
  iptv: 'IPTV',
  ott: 'OTT',
  dth: 'Doğrudan Eve Yayın (DTH)',
};
