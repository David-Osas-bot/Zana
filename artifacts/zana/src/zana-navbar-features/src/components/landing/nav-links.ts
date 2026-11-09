// Section ids must match the id on each landing section.
export const navLinks = [
  { id: 'product-tour', label: 'Product' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'features', label: 'Features' },
] as const;

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Sections use scroll-mt-24, which keeps their top clear of the fixed header.
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
}
