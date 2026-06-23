export function trackPageView(path: string): void {
  if (typeof window !== 'undefined' && 'ga' in window) {
    const ga = (window as Record<string, unknown>).ga as (command: string, type: string, page: string) => void;
    ga('send', 'pageview', path);
  }
}
