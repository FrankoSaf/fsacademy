/**
 * Single source of truth for the business facts that appear in more than one
 * place: NAP (name/address/phone), geo coordinates, opening hours, instruments.
 *
 * These were previously re-typed in BaseLayout.astro, duesseldorf.astro,
 * neuss.astro and [location]/unterricht/[instrument].astro. Four copies of an
 * address is four chances to publish a stale one - and inconsistent NAP across
 * pages actively hurts local search. Change it here and every page and every
 * JSON-LD block follows.
 */

export const CONTACT = {
  name: 'Fine Sound Academy',
  /** E.164 for `tel:` hrefs and schema.org. */
  phone: '+4917677154511',
  /** Human-readable form for display. */
  phoneDisplay: '+49 176 77154511',
  email: 'info@finesoundacademy.com',
  whatsapp: 'https://wa.me/4917677154511',
} as const;

export interface OpeningHours {
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

/** Shared by both locations; override per-location if that ever diverges. */
export const OPENING_HOURS: OpeningHours[] = [
  {
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '10:00',
    closes: '20:00',
  },
  { dayOfWeek: 'Saturday', opens: '09:00', closes: '12:00' },
];

export interface SiteLocation {
  /** URL slug, and the key used in teachers.json `cities`. */
  slug: 'duesseldorf' | 'neuss';
  /** Display name, with umlauts. */
  name: string;
  /** Street as shown to humans (e.g. "Kaiserstraße 28"). */
  street: string;
  /** Abbreviated street for schema.org / compact display. */
  streetShort: string;
  postalCode: string;
  region: string;
  /** Neighbourhood, used in prose ("mitten in <area>"). */
  area: string;
  /** Prepositional phrase for sentences: "Unser Unterricht findet in <areaPhrase> statt." */
  areaPhrase: string;
  geo: { latitude: number; longitude: number };
}

export const LOCATIONS: SiteLocation[] = [
  {
    slug: 'duesseldorf',
    name: 'Düsseldorf',
    street: 'Kaiserstraße 28',
    streetShort: 'Kaiserstr. 28',
    postalCode: '40479',
    region: 'Nordrhein-Westfalen',
    area: 'Pempelfort',
    areaPhrase: 'Düsseldorf-Pempelfort',
    geo: { latitude: 51.23387, longitude: 6.77908 },
  },
  {
    slug: 'neuss',
    name: 'Neuss',
    street: 'Neumarkt 18',
    streetShort: 'Neumarkt 18',
    postalCode: '41460',
    region: 'Nordrhein-Westfalen',
    area: 'Neusser Innenstadt',
    areaPhrase: 'der Neusser Innenstadt',
    geo: { latitude: 51.1985, longitude: 6.6929 },
  },
];

export function getLocation(slug: string | undefined): SiteLocation | undefined {
  // Older URLs and some CMS entries use the un-umlauted spelling.
  const normalized = slug === 'dusseldorf' ? 'duesseldorf' : slug;
  return LOCATIONS.find((l) => l.slug === normalized);
}

export interface SiteInstrument {
  slug: string;
  /** Bare instrument name ("Klavier"). */
  name: string;
  /** Lesson noun ("Klavierunterricht"). */
  lesson: string;
}

export const INSTRUMENTS: SiteInstrument[] = [
  { slug: 'klavier', name: 'Klavier', lesson: 'Klavierunterricht' },
  { slug: 'gitarre', name: 'Gitarre', lesson: 'Gitarrenunterricht' },
  { slug: 'bass', name: 'Bass', lesson: 'Bassunterricht' },
  { slug: 'gesang', name: 'Gesang', lesson: 'Gesangsunterricht' },
  { slug: 'schlagzeug', name: 'Schlagzeug', lesson: 'Schlagzeugunterricht' },
];

/** Map a lesson noun back to its slug, for CMS rows that only carry a title. */
export const LESSON_TO_SLUG: Record<string, string> = Object.fromEntries(
  INSTRUMENTS.map((i) => [i.lesson, i.slug])
);

/** schema.org PostalAddress for a location. */
export function postalAddress(loc: SiteLocation) {
  return {
    '@type': 'PostalAddress',
    streetAddress: loc.streetShort,
    addressLocality: loc.name,
    addressRegion: loc.region,
    postalCode: loc.postalCode,
    addressCountry: 'DE',
  };
}

/** schema.org OpeningHoursSpecification list. */
export function openingHoursSpec(hours: OpeningHours[] = OPENING_HOURS) {
  return hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
  }));
}

/**
 * schema.org School node for one location.
 * `siteUrl` must already carry its trailing slash.
 */
export function schoolSchema(
  loc: SiteLocation,
  siteUrl: string,
  opts: { description?: string; url?: string } = {}
) {
  return {
    '@type': 'School',
    '@id': `${siteUrl}${loc.slug}/#school`,
    name: `${CONTACT.name} ${loc.name}`,
    ...(opts.description && { description: opts.description }),
    url: opts.url ?? `${siteUrl}${loc.slug}/`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: postalAddress(loc),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: loc.geo.latitude,
      longitude: loc.geo.longitude,
    },
    openingHoursSpecification: openingHoursSpec(),
    areaServed: { '@type': 'City', name: loc.name },
  };
}
