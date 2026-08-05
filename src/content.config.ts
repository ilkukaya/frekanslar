import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import {
  broadcasterSchema,
  citySchema,
  districtSchema,
  frequencyUpdateSchema,
  guideFrontmatterSchema,
  platformChannelSchema,
  platformSchema,
  radioStationSchema,
  satelliteSchema,
  satelliteServiceSchema,
  sourceSchema,
  televisionChannelSchema,
  terrestrialFrequencySchema,
  transmitterSchema,
  transponderSchema,
} from './data/schemas';

const cities = defineCollection({
  loader: file('src/data/cities.json'),
  schema: citySchema,
});

const districts = defineCollection({
  loader: file('src/data/districts.json'),
  schema: districtSchema,
});

const transmitters = defineCollection({
  loader: file('src/data/terrestrial-transmitters.json'),
  schema: transmitterSchema,
});

const broadcasters = defineCollection({
  loader: file('src/data/broadcasters.json'),
  schema: broadcasterSchema,
});

const radioStations = defineCollection({
  loader: file('src/data/radio-stations.json'),
  schema: radioStationSchema,
});

const televisionChannels = defineCollection({
  loader: file('src/data/television-channels.json'),
  schema: televisionChannelSchema,
});

const terrestrialFrequencies = defineCollection({
  loader: file('src/data/terrestrial-frequencies.json'),
  schema: terrestrialFrequencySchema,
});

const satellites = defineCollection({
  loader: file('src/data/satellites.json'),
  schema: satelliteSchema,
});

const transponders = defineCollection({
  loader: file('src/data/transponders.json'),
  schema: transponderSchema,
});

const satelliteServices = defineCollection({
  loader: file('src/data/satellite-services.json'),
  schema: satelliteServiceSchema,
});

const platforms = defineCollection({
  loader: file('src/data/platforms.json'),
  schema: platformSchema,
});

const platformChannels = defineCollection({
  loader: file('src/data/platform-channels.json'),
  schema: platformChannelSchema,
});

const frequencyUpdates = defineCollection({
  loader: file('src/data/frequency-updates.json'),
  schema: frequencyUpdateSchema,
});

const sources = defineCollection({
  loader: file('src/data/sources.json'),
  schema: sourceSchema,
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: guideFrontmatterSchema,
});

export const collections = {
  cities,
  districts,
  transmitters,
  broadcasters,
  'radio-stations': radioStations,
  'television-channels': televisionChannels,
  'terrestrial-frequencies': terrestrialFrequencies,
  satellites,
  transponders,
  'satellite-services': satelliteServices,
  platforms,
  'platform-channels': platformChannels,
  'frequency-updates': frequencyUpdates,
  sources,
  guides,
};
