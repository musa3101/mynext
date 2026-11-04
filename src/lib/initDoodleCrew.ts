/**
 * Lazy initializer for Doodle Crew Footer ("BY MUSA" from 21st.dev).
 * Uses IntersectionObserver so React and SVG animations only load when scrolled near the footer.
 */
export function initDoodleCrewFooter(containerId = 'doodle-crew-root'): void {
  const doodleRoot = document.getElementById(containerId);
  if (!doodleRoot) return;

  if ('IntersectionObserver' in window) {
    const doodleObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          doodleObserver.disconnect();
          import('../components/mountDoodleCrew').then((m) => m.mountDoodleCrewFooter(containerId));
        }
      },
      { rootMargin: '800px 0px 400px 0px' }
    );
    doodleObserver.observe(doodleRoot);
  } else {
    import('../components/mountDoodleCrew').then((m) => m.mountDoodleCrewFooter(containerId));
  }
}

