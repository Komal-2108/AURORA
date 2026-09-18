import { useEffect } from 'react';

/**
 * Global Scroll Reveal Hook
 * 
 * Automatically detects the custom scroll container (.content or window),
 * identifies cards and panels below the initial viewport, and smoothly
 * animates them to full opacity and position when scrolled into view.
 * 
 * Handles page navigation, deep-links, scroll restoration, and window resizing.
 */
export function useScrollReveal(activePage) {
  useEffect(() => {
    // Select all potential card/section targets
    const TARGET_SELECTORS = [
      '.metric-card',
      '.rail-card',
      '.cinematic-panel',
      '.panel',
      '.module-mini-card',
      '.optimizer-card',
      '.alert-card',
      '.help-card',
      '.setting-row',
      '.timeline-row',
      '.live-stage',
      '.energy-flow-stage',
      '.optimization-stage',
      '.fuel-banner',
      '.battery-showcase',
      '.report-stream',
      '.alert-radar',
      '.settings-stage',
      '.knowledge-stage',
      '.cinematic-kpi-strip > *',
      '.command-deck > *',
      '.module-grid > *',
      '.warm-grid > *'
    ].join(', ');

    // Allow DOM to render for the active page
    const timer = setTimeout(() => {
      const contentEl = document.querySelector('.content');
      const isCustomScroller = contentEl && (contentEl.scrollHeight > contentEl.clientHeight + 10);
      const scrollRoot = isCustomScroller ? contentEl : null;

      const elements = Array.from(document.querySelectorAll(TARGET_SELECTORS));
      if (!elements.length) return;

      document.documentElement.classList.add('js-reveal-ready');

      // Get container visible bounds
      const containerRect = contentEl ? contentEl.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      const viewportBottom = isCustomScroller ? containerRect.bottom : window.innerHeight;

      // Check each element's initial position
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // If element is already within view or slightly below top of container, mark visible immediately
        if (rect.top < viewportBottom + 60 && rect.bottom > (isCustomScroller ? containerRect.top - 60 : -60)) {
          el.classList.add('in-view', 'is-visible');
        } else {
          el.classList.add('will-reveal');
        }
      });

      // IntersectionObserver to reveal on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting || entry.intersectionRatio > 0.02) {
            entry.target.classList.add('in-view', 'is-visible');
            entry.target.classList.remove('will-reveal');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: scrollRoot,
        rootMargin: '80px 0px 80px 0px',
        threshold: [0, 0.05, 0.1]
      });

      elements.forEach(el => {
        if (!el.classList.contains('in-view')) {
          observer.observe(el);
        }
      });

      // Scroll event listener fallback
      const handleScroll = () => {
        const currentContainerRect = contentEl ? contentEl.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
        const currentBottom = isCustomScroller ? currentContainerRect.bottom : window.innerHeight;

        elements.forEach(el => {
          if (!el.classList.contains('in-view')) {
            const rect = el.getBoundingClientRect();
            if (rect.top < currentBottom + 80) {
              el.classList.add('in-view', 'is-visible');
              el.classList.remove('will-reveal');
              observer.unobserve(el);
            }
          }
        });
      };

      const scrollTarget = isCustomScroller ? contentEl : window;
      scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        scrollTarget.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }, 60);

    return () => clearTimeout(timer);
  }, [activePage]);
}
