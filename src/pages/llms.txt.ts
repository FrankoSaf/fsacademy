import type { APIRoute } from 'astro';
import { LOCATIONS, INSTRUMENTS, CONTACT, OPENING_HOURS } from '../lib/site';
import globals from '../../content/globals.json';
import duesseldorf from '../../content/duesseldorf.json';
import neuss from '../../content/neuss.json';
import sharedPricing from '../../content/shared/pricing.json';

/**
 * /llms.txt, generated rather than hand-maintained.
 *
 * The previous version was a static file in public/. It had drifted: every URL
 * was missing the trailing slash this site canonicalises to (so each one
 * 301'd), it listed a phone number formatted differently from the footer, and
 * it omitted the ten <city>/unterricht/<instrument>/ pages - the most useful
 * ones for a model answering "piano lessons in Neuss". It also wrote URLs as
 * bare text, while the llmstxt.org format expects Markdown links.
 *
 * Building it from src/lib/site.ts and the CMS content means it cannot fall out
 * of step with the site again.
 */

const SITE = 'https://finesoundacademy.com';

/** Markdown link with an absolute, trailing-slashed URL. */
const link = (label: string, path: string, note?: string) => {
  const url = path.startsWith('http')
    ? path
    : `${SITE}${path.endsWith('/') || path.includes('.') ? path : `${path}/`}`;
  return `- [${label}](${url})${note ? `: ${note}` : ''}`;
};

const DAY_DE: Record<string, string> = {
  Monday: 'Mo',
  Tuesday: 'Di',
  Wednesday: 'Mi',
  Thursday: 'Do',
  Friday: 'Fr',
  Saturday: 'Sa',
  Sunday: 'So',
};

function formatHours(): string[] {
  return OPENING_HOURS.map((h) => {
    const days = Array.isArray(h.dayOfWeek) ? h.dayOfWeek : [h.dayOfWeek];
    const label =
      days.length > 1
        ? `${DAY_DE[days[0]] ?? days[0]}–${DAY_DE[days[days.length - 1]] ?? days[days.length - 1]}`
        : (DAY_DE[days[0]] ?? days[0]);
    return `- ${label}: ${h.opens}–${h.closes} Uhr`;
  });
}

const CITY_CONTENT: Record<string, { directionsCard?: { lines?: unknown } }> = {
  duesseldorf: duesseldorf as { directionsCard?: { lines?: unknown } },
  neuss: neuss as { directionsCard?: { lines?: unknown } },
};

/** CMS list rows arrive as strings or { line } objects. */
function lines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v : (v as { line?: string })?.line ?? ''))
    .filter(Boolean);
}

function build(): string {
  const probestundeUrl =
    (globals as { probestundeUrl?: string }).probestundeUrl ?? `${SITE}/`;
  const plans = (sharedPricing as { plans?: Array<{ name: string; price: string; description?: string }> }).plans ?? [];

  const out: string[] = [];

  out.push('# Fine Sound Academy');
  out.push('');
  out.push(
    '> Musikschule in Düsseldorf und Neuss — professioneller Instrumental- und Gesangsunterricht für Kinder ab 6 Jahren, Jugendliche und Erwachsene. Kostenlose Probestunde.'
  );
  out.push('');
  out.push(
    'Zwei Standorte in Nordrhein-Westfalen. Einzel- und Gruppenunterricht in Klavier, Gitarre, Gesang, Bass und Schlagzeug, von Anfängern bis Fortgeschrittenen. Die Lehrkräfte sind ausgebildete Musikpädagoginnen und -pädagogen sowie aktive Musikerinnen und Musiker.'
  );
  out.push('');

  out.push('## Wichtige Seiten');
  out.push('');
  out.push(link('Startseite', '/'));
  out.push(link('Unterricht — Überblick aller Instrumente', '/unterricht'));
  out.push(link('Preise', '/preise', 'Tarife, Familienrabatt, häufige Fragen'));
  out.push(link('Über uns', '/about'));
  out.push(link('Kostenlose Probestunde buchen', probestundeUrl));
  out.push('');

  out.push('## Standorte');
  out.push('');
  for (const loc of LOCATIONS) {
    out.push(`### ${loc.name}`);
    out.push('');
    out.push(link(`Musikschule ${loc.name}`, `/${loc.slug}`));
    out.push(`- Adresse: ${loc.street}, ${loc.postalCode} ${loc.name}`);
    out.push(`- Stadtteil/Lage: ${loc.area}`);
    for (const l of lines(CITY_CONTENT[loc.slug]?.directionsCard?.lines).slice(2)) {
      out.push(`- ${l.replace(/\*\*/g, '')}`);
    }
    out.push('');
  }

  out.push('### Öffnungszeiten (beide Standorte)');
  out.push('');
  out.push(...formatHours());
  out.push('- So: Geschlossen');
  out.push('');

  out.push('## Unterricht nach Instrument und Standort');
  out.push('');
  out.push(
    'Jede Kombination aus Instrument und Standort hat eine eigene Seite mit Lehrkräften, Preisen und Antworten auf häufige Fragen.'
  );
  out.push('');
  for (const loc of LOCATIONS) {
    out.push(`### ${loc.name}`);
    out.push('');
    for (const inst of INSTRUMENTS) {
      out.push(
        link(`${inst.lesson} in ${loc.name}`, `/${loc.slug}/unterricht/${inst.slug}`)
      );
    }
    out.push('');
  }

  out.push('## Preise');
  out.push('');
  for (const p of plans) {
    out.push(`- ${p.name}: ${p.price} pro Monat${p.description ? ` — ${p.description}` : ''}`);
  }
  out.push('');
  out.push('Kostenlose Probestunde. Familienrabatte möglich.');
  out.push('');
  out.push(link('Alle Preise und Konditionen', '/preise'));
  out.push('');

  out.push('## Kontakt');
  out.push('');
  out.push(`- Telefon: ${CONTACT.phoneDisplay}`);
  out.push(`- E-Mail: ${CONTACT.email}`);
  out.push(link('WhatsApp', CONTACT.whatsapp));
  out.push(link('Website', '/'));
  out.push('');

  out.push('## Rechtliches');
  out.push('');
  out.push(link('Impressum', '/impressum'));
  out.push(link('Datenschutz', '/datenschutz'));
  out.push('');

  return out.join('\n');
}

export const GET: APIRoute = () =>
  new Response(build(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
