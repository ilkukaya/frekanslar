/**
 * Progressive enhancement for the correction form:
 * - Pre-fills "İlgili yayın" from a `?ilgili=` query param (used by the
 *   "Bu yayın kuruluşunu temsil ediyor musunuz?" links on profile pages).
 * - Fires the `correction_submitted` analytics event on submit.
 * The form itself (required fields, Netlify submission) works without
 * any of this.
 */
const form = document.querySelector<HTMLFormElement>('[data-correction-form]');

if (form) {
  const params = new URLSearchParams(window.location.search);
  const prefill = params.get('ilgili');
  if (prefill) {
    const broadcastInput = form.querySelector<HTMLInputElement>('[data-correction-broadcast-input]');
    if (broadcastInput && !broadcastInput.value) {
      broadcastInput.value = prefill;
    }
  }

  form.addEventListener('submit', () => {
    window.frekanslarTrack?.('correction_submitted', {});
  });
}
