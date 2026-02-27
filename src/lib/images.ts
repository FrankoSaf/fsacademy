/**
 * Build Netlify Image CDN URLs for on-demand resize/optimization.
 * Local /uploads/ and remote (allowlisted) images are transformed at the edge.
 * In local dev without Netlify, returns original src for static images.
 */
const NETLIFY_IMAGES = '/.netlify/images';

export function getNetlifyImageUrl(
  src: string,
  options: { w?: number; h?: number; q?: number; fit?: string; position?: string; fm?: string } = {}
): string {
  const url = src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}`;
  const params = new URLSearchParams();
  params.set('url', url);
  if (options.w) params.set('w', String(options.w));
  if (options.h) params.set('h', String(options.h));
  if (options.q) params.set('q', String(options.q));
  if (options.fit) params.set('fit', options.fit);
  if (options.position) params.set('position', options.position);
  if (options.fm) params.set('fm', options.fm);
  return `${NETLIFY_IMAGES}?${params.toString()}`;
}

export type ImagePreset = 'teacher' | 'hero' | 'instrument' | 'location' | 'about';

const PRESETS: Record<ImagePreset, { widths: number[]; sizes: string; q?: number }> = {
  teacher: {
    widths: [280, 400, 560],
    sizes: '(min-width: 1200px) 280px, (min-width: 768px) 25vw, 100vw',
    q: 75,
  },
  hero: {
    widths: [640, 960, 1280, 1440],
    sizes: '(min-width: 1440px) 1440px, 100vw',
    q: 80,
  },
  instrument: {
    widths: [400, 600, 800],
    sizes: '(min-width: 768px) 50vw, 100vw',
    q: 80,
  },
  location: {
    widths: [600, 800, 1200],
    sizes: '(min-width: 768px) 50vw, 100vw',
    q: 80,
  },
  about: {
    widths: [600, 900],
    sizes: '(min-width: 768px) 400px, 100vw',
    q: 80,
  },
};

export function getPreset(preset: ImagePreset) {
  return PRESETS[preset];
}
