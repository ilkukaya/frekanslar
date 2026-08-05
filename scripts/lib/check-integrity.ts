/**
 * Referential-integrity checks across the normalized data files: every
 * foreign key (cityId, stationId, transponderId, sourceIds, ...) must
 * point at a record that actually exists. Schemas defined in
 * `src/data/schemas.ts` deliberately use plain string ids instead of
 * Astro's `reference()` helper (see the comment there) specifically so
 * this check can run standalone, outside the content layer.
 */
import type { LoadedData, LoadIssue } from './load-data';

function checkRef(
  issues: LoadIssue[],
  file: string,
  recordId: string,
  field: string,
  value: string | null | undefined,
  validIds: ReadonlySet<string>,
): void {
  if (value == null) return;
  if (!validIds.has(value)) {
    issues.push({ file, message: `${recordId}: ${field} references unknown id "${value}"` });
  }
}

function checkSourceIds(issues: LoadIssue[], file: string, recordId: string, sourceIds: readonly string[], validSourceIds: ReadonlySet<string>): void {
  for (const sourceId of sourceIds) {
    checkRef(issues, file, recordId, 'sourceIds', sourceId, validSourceIds);
  }
}

export function checkReferentialIntegrity(data: LoadedData): LoadIssue[] {
  const issues: LoadIssue[] = [];

  const cityIds = new Set(data.cities.map((c) => c.id));
  const districtIds = new Set(data.districts.map((d) => d.id));
  const transmitterIds = new Set(data.transmitters.map((t) => t.id));
  const broadcasterIds = new Set(data.broadcasters.map((b) => b.id));
  const radioStationIds = new Set(data.radioStations.map((s) => s.id));
  const televisionChannelIds = new Set(data.televisionChannels.map((c) => c.id));
  const satelliteIds = new Set(data.satellites.map((s) => s.id));
  const transponderIds = new Set(data.transponders.map((t) => t.id));
  const platformIds = new Set(data.platforms.map((p) => p.id));
  const sourceIds = new Set(data.sources.map((s) => s.id));

  for (const district of data.districts) {
    checkRef(issues, 'districts.json', district.id, 'cityId', district.cityId, cityIds);
  }

  for (const transmitter of data.transmitters) {
    checkRef(issues, 'terrestrial-transmitters.json', transmitter.id, 'cityId', transmitter.cityId, cityIds);
    checkRef(issues, 'terrestrial-transmitters.json', transmitter.id, 'districtId', transmitter.districtId, districtIds);
  }

  for (const broadcaster of data.broadcasters) {
    checkRef(issues, 'broadcasters.json', broadcaster.id, 'headquarters', broadcaster.headquarters, cityIds);
    checkSourceIds(issues, 'broadcasters.json', broadcaster.id, broadcaster.sourceIds, sourceIds);
  }

  for (const station of data.radioStations) {
    checkRef(issues, 'radio-stations.json', station.id, 'headquarters', station.headquarters, cityIds);
    checkRef(issues, 'radio-stations.json', station.id, 'owner', station.owner, broadcasterIds);
    checkSourceIds(issues, 'radio-stations.json', station.id, station.sourceIds, sourceIds);
  }

  for (const channel of data.televisionChannels) {
    checkRef(issues, 'television-channels.json', channel.id, 'headquarters', channel.headquarters, cityIds);
    checkRef(issues, 'television-channels.json', channel.id, 'owner', channel.owner, broadcasterIds);
    checkSourceIds(issues, 'television-channels.json', channel.id, channel.sourceIds, sourceIds);
  }

  for (const freq of data.terrestrialFrequencies) {
    checkRef(issues, 'terrestrial-frequencies.json', freq.id, 'stationId', freq.stationId, radioStationIds);
    checkRef(issues, 'terrestrial-frequencies.json', freq.id, 'cityId', freq.cityId, cityIds);
    checkRef(issues, 'terrestrial-frequencies.json', freq.id, 'districtId', freq.districtId, districtIds);
    checkRef(issues, 'terrestrial-frequencies.json', freq.id, 'transmitterId', freq.transmitterId, transmitterIds);
    checkSourceIds(issues, 'terrestrial-frequencies.json', freq.id, freq.sourceIds, sourceIds);
  }

  for (const tvChannel of data.terrestrialTvChannels) {
    checkRef(issues, 'terrestrial-tv-channels.json', tvChannel.id, 'channelId', tvChannel.channelId, televisionChannelIds);
    checkRef(issues, 'terrestrial-tv-channels.json', tvChannel.id, 'cityId', tvChannel.cityId, cityIds);
    checkRef(issues, 'terrestrial-tv-channels.json', tvChannel.id, 'districtId', tvChannel.districtId, districtIds);
    checkRef(issues, 'terrestrial-tv-channels.json', tvChannel.id, 'transmitterId', tvChannel.transmitterId, transmitterIds);
    checkSourceIds(issues, 'terrestrial-tv-channels.json', tvChannel.id, tvChannel.sourceIds, sourceIds);
  }

  for (const satellite of data.satellites) {
    checkSourceIds(issues, 'satellites.json', satellite.id, satellite.sourceIds, sourceIds);
  }

  for (const transponder of data.transponders) {
    checkRef(issues, 'transponders.json', transponder.id, 'satelliteId', transponder.satelliteId, satelliteIds);
    checkSourceIds(issues, 'transponders.json', transponder.id, transponder.sourceIds, sourceIds);
  }

  for (const service of data.satelliteServices) {
    checkRef(issues, 'satellite-services.json', service.id, 'satelliteId', service.satelliteId, satelliteIds);
    checkRef(issues, 'satellite-services.json', service.id, 'transponderId', service.transponderId, transponderIds);
    const stationIds = service.broadcastKind === 'radio' ? radioStationIds : televisionChannelIds;
    checkRef(issues, 'satellite-services.json', service.id, 'stationId', service.stationId, stationIds);
    checkSourceIds(issues, 'satellite-services.json', service.id, service.sourceIds, sourceIds);
  }

  for (const entry of data.platformChannels) {
    checkRef(issues, 'platform-channels.json', entry.id, 'platformId', entry.platformId, platformIds);
    const channelIds = entry.broadcastKind === 'radio' ? radioStationIds : televisionChannelIds;
    checkRef(issues, 'platform-channels.json', entry.id, 'channelId', entry.channelId, channelIds);
    checkSourceIds(issues, 'platform-channels.json', entry.id, entry.sourceIds, sourceIds);
  }

  for (const platform of data.platforms) {
    checkSourceIds(issues, 'platforms.json', platform.id, platform.sourceIds, sourceIds);
  }

  for (const update of data.frequencyUpdates) {
    checkRef(issues, 'frequency-updates.json', update.id, 'relatedStationId', update.relatedStationId, radioStationIds);
    checkRef(issues, 'frequency-updates.json', update.id, 'relatedChannelId', update.relatedChannelId, televisionChannelIds);
    checkRef(issues, 'frequency-updates.json', update.id, 'cityId', update.cityId, cityIds);
    checkSourceIds(issues, 'frequency-updates.json', update.id, update.sourceIds, sourceIds);
  }

  return issues;
}
