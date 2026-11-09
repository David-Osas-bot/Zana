import { useEffect, useState } from 'react';

// Returns the id of the section currently crossing the middle of the screen,
// or null while the page is above the first section.
export function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    const elements = key
      .split('|')
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
          else setActive(current => (current === entry.target.id ? null : current));
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

export default useScrollSpy;
