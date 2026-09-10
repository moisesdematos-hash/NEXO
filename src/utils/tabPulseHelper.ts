export function pulseNexoTab(tabPath: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexo_pulse_tab', { detail: { tabPath } }));
  }
}
