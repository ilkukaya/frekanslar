/**
 * Generic "copy to clipboard" wiring for any button with
 * `data-copy-button` + `data-copy-target="#elementId"`. The code block it
 * copies from is always visible and selectable on its own, so copying
 * still "works" (via manual select + copy) even if this script fails to
 * load -- this only adds convenience.
 */
import { ANALYTICS_EVENTS, type AnalyticsEvent } from '../lib/analytics';

function isAnalyticsEvent(value: string): value is AnalyticsEvent {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

document.querySelectorAll<HTMLButtonElement>('[data-copy-button]').forEach((button) => {
  const targetSelector = button.dataset.copyTarget;
  if (!targetSelector) return;
  const target = document.querySelector<HTMLElement>(targetSelector);
  if (!target) return;

  const defaultLabel = button.textContent ?? 'Kopyala';

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(target.textContent ?? '');
      button.textContent = 'Kopyalandı';
      setTimeout(() => {
        button.textContent = defaultLabel;
      }, 2000);

      const eventName = button.dataset.analyticsEvent;
      if (eventName && isAnalyticsEvent(eventName)) {
        window.frekanslarTrack?.(eventName, {});
      }
    } catch {
      // Clipboard API unavailable/blocked -- the code is still selectable by hand.
      button.textContent = 'Kopyalanamadı, elle seçin';
      setTimeout(() => {
        button.textContent = defaultLabel;
      }, 2000);
    }
  });
});
