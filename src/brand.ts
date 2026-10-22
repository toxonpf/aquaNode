import logoUrl from './assets/logo.svg?url';
import logoSource from './assets/logo.svg?raw';

export {logoUrl};
export const logoMarkup=logoSource.replace(/\b(fill|stroke)="(?!none")[^"]*"/g,'$1="currentColor"');
// Reuse the actual SVG paths in the navy ink used on the ivory enclosure.
export const modelLogoUrl='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(
  logoSource.replace(/\b(fill|stroke)="(?!none")[^"]*"/g,'$1="#204853"'),
);
