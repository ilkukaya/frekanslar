/**
 * Generates the embeddable, inline-styled HTML badge broadcasters can
 * paste onto their own site. Deliberately dependency-free HTML (inline
 * styles only) so it renders correctly on an arbitrary third-party page
 * with no external CSS/JS. The domain always comes from `siteConfig`, not
 * a hardcoded string, so it stays correct once a real production domain
 * is set.
 */

export type BadgeVariant = 'neutral' | 'verified';

export interface BadgeOptions {
  variant: BadgeVariant;
  profileUrl: string;
}

const BADGE_TEXT: Record<BadgeVariant, string> = {
  neutral: 'Frekans Bilgilerini Görüntüle — Frekanslar',
  verified: "Frekanslar'da Doğrulanmış Yayın",
};

const BADGE_COLORS: Record<BadgeVariant, { background: string; foreground: string; border: string }> = {
  neutral: { background: '#f6f7f9', foreground: '#12161f', border: '#e2e5ea' },
  verified: { background: '#eff6ff', foreground: '#1d4ed8', border: '#dbeafe' },
};

/** Builds the raw HTML snippet for an embeddable Frekanslar badge. */
export function buildBadgeSnippet({ variant, profileUrl }: BadgeOptions): string {
  const text = BADGE_TEXT[variant];
  const colors = BADGE_COLORS[variant];
  const style = [
    'display:inline-flex',
    'align-items:center',
    'gap:6px',
    'padding:6px 12px',
    'border-radius:6px',
    `background:${colors.background}`,
    `color:${colors.foreground}`,
    `border:1px solid ${colors.border}`,
    "font:600 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    'text-decoration:none',
  ].join(';');

  return `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="${style}">${text}</a>`;
}
