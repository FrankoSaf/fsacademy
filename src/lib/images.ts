/**
 * Build Netlify Image CDN URLs for on-demand resize/optimization.
 * Presets match component layout dimensions (width, height, aspect ratio).
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

/** { w, h } pairs for srcset; sizes for slot; q for quality */
export interface ImagePresetConfig {
  dimensions: { w: number; h: number }[];
  sizes: string;
  q?: number;
}

const PRESETS: Record<ImagePreset, ImagePresetConfig> = {
  /** Team / campaign teachers: 1:1, max 800px; single-teacher layouts must not stretch small source images */
  teacher: {
    dimensions: [
      { w: 280, h: 280 },
      { w: 400, h: 400 },
      { w: 560, h: 560 },
      { w: 800, h: 800 },
    ],
    sizes: '(min-width: 1200px) min(800px, 33vw), (min-width: 900px) min(800px, 50vw), (min-width: 768px) min(800px, 90vw), min(800px, 90vw)',
    q: 75,
  },
  /** Hero: full viewport, 16:9 typical */
  hero: {
    dimensions: [
      { w: 640, h: 360 },
      { w: 960, h: 540 },
      { w: 1280, h: 720 },
      { w: 1440, h: 810 },
      { w: 1920, h: 1080 },
    ],
    sizes: '(min-width: 1920px) 1920px, (min-width: 1440px) 1440px, 100vw',
    q: 80,
  },
  /** Unterricht instruments: .instrument-image 600x400 (3:2) desktop, ~375x300 mobile */
  instrument: {
    dimensions: [
      { w: 360, h: 240 },
      { w: 540, h: 360 },
      { w: 600, h: 400 },
    ],
    sizes: '(min-width: 768px) 600px, 100vw',
    q: 80,
  },
  /** Locations: .location-card aspect-ratio 16:10 desktop, 3:2 mobile; 2-col → max ~580x362 */
  location: {
    dimensions: [
      { w: 400, h: 250 },
      { w: 580, h: 362 },
      { w: 720, h: 450 },
    ],
    sizes: '(min-width: 768px) 580px, 100vw',
    q: 80,
  },
  /** About: .about-image 1fr in 2-col, ~560x420 (4:3), min-height 400px */
  about: {
    dimensions: [
      { w: 400, h: 300 },
      { w: 560, h: 420 },
      { w: 640, h: 480 },
    ],
    sizes: '(min-width: 768px) 560px, 100vw',
    q: 80,
  },
};

export function getPreset(preset: ImagePreset) {
  return PRESETS[preset];
}
