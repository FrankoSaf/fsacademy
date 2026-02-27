/**
 * Normalize list fields that can come from CMS as either string[] or { key: string }[].
 * Netlify/Decap CMS list widget with one text field saves as array of objects.
 */

export function normalizeParagraphs(
  value: unknown
): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === 'string' ? item : (item && (item as { paragraph?: string; p?: string }).paragraph) || (item as { p?: string }).p || ''
  );
}

export function normalizeLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === 'string' ? item : (item && (item as { line?: string }).line) || ''
  );
}

/** Normalize CMS list of slugs (e.g. instruments, cities) from { slug: string }[] to string[] */
export function normalizeSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === 'string' ? item : (item && (item as { slug?: string }).slug) || ''
  ).filter(Boolean);
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  image: string;
  alt: string;
  instruments: string[];
  cities: string[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  address: string;
  subtitle: string;
  hero: { title: string; subtitle: string; text: string };
  directionsCard: { title: string; lines: unknown };
  hoursCard: { title: string; lines: unknown };
  intro: { heading: string; paragraphs: unknown };
}

/** Load and normalize teachers from content/teachers.json */
export async function getTeachers(): Promise<Teacher[]> {
  const data = (await import('../../content/teachers.json')).default as { teachers?: Array<Record<string, unknown>> };
  const raw = data.teachers ?? [];
  return raw.map((t) => ({
    id: String(t.id ?? ''),
    name: String(t.name ?? ''),
    role: String(t.role ?? ''),
    image: String(t.image ?? ''),
    alt: String(t.alt ?? ''),
    instruments: normalizeSlugs(t.instruments),
    cities: normalizeSlugs(t.cities),
  }));
}

/** Load and normalize cities from content/cities.json */
export async function getCities(): Promise<City[]> {
  const data = (await import('../../content/cities.json')).default as { cities?: Array<Record<string, unknown>> };
  const raw = data.cities ?? [];
  return raw.map((c) => ({
    id: String(c.id ?? ''),
    name: String(c.name ?? ''),
    slug: String(c.slug ?? ''),
    address: String(c.address ?? ''),
    subtitle: String(c.subtitle ?? ''),
    hero: {
      title: String((c.hero as Record<string, unknown>)?.title ?? ''),
      subtitle: String((c.hero as Record<string, unknown>)?.subtitle ?? ''),
      text: String((c.hero as Record<string, unknown>)?.text ?? ''),
    },
    directionsCard: (c.directionsCard as { title: string; lines: unknown }) ?? { title: '', lines: [] },
    hoursCard: (c.hoursCard as { title: string; lines: unknown }) ?? { title: '', lines: [] },
    intro: (c.intro as { heading: string; paragraphs: unknown }) ?? { heading: '', paragraphs: [] },
  }));
}

/** Get teachers who teach a given instrument in a given city */
export function getTeachersForInstrumentAndCity(
  teachers: Teacher[],
  instrumentSlug: string,
  citySlug: string
): Teacher[] {
  const cityNorm = citySlug === 'dusseldorf' ? 'duesseldorf' : citySlug;
  return teachers.filter(
    (t) =>
      t.instruments.includes(instrumentSlug) &&
      t.cities.includes(cityNorm)
  );
}
