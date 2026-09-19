const NAME_TO_SLUG = {
  'Mixed Martial Arts': 'mixed-martial-arts',
  Boxing: 'boxing',
  'Muay Thai': 'muay-thai',
  Kickboxing: 'kickboxing',
  'Brazilian Jiu-Jitsu': 'brazilian-jiu-jitsu',
  Wrestling: 'wrestling',
  'Strength & Combat Conditioning': 'strength-combat-conditioning',
  'Cross Training': 'cross-training',
  'Functional Fitness': 'functional-fitness',
  'Body Toning': 'body-toning',
  Yoga: 'yoga',
  'Personal Training': 'personal-training',
};

function GenericBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="19" fill="currentColor" opacity="0.18" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M22 42 32 22l10 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="18" r="3.4" fill="currentColor" />
    </svg>
  );
}

function MixedMartialArtsBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M21 22c0-4 3-7 7-7h2l4-5 4 5h2c4 0 7 3 7 7v12h-3v10c0 7-5 12-12 12s-12-5-12-12V22h3zm7 5h10v-3H28v3zm-2 8h14v-3H26v3zm0 8h14v-3H26v3z" fill="currentColor" />
      <path d="M12 28c2 2 5 3 8 3h4l-4 6h-5c-3 0-6-2-7-5l4-4z" fill="currentColor" opacity="0.9" />
      <path d="M52 28c-2 2-5 3-8 3h-4l4 6h5c3 0 6-2 7-5l-4-4z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function BoxingBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 22c0-5 4-9 9-9h12c5 0 9 4 9 9v10c0 6-4 11-10 13l-4 1-3 9h-9l-3-9-4-1C22 43 18 38 18 32V22zm10 6h10v-3H28v3zm0 8h10v-3H28v3zm3-17h4v-3h-4v3z" fill="currentColor" />
      <path d="M18 26h-5c-1 0-2 1-2 2v7c0 1 1 2 2 2h5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 26h5c1 0 2 1 2 2v7c0 1-1 2-2 2h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 32h10M27 29h10M27 35h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MuayThaiBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 35 31 22l8 5 8-8 6 5-10 12-7-4-7 11-8-5 9-11z" fill="currentColor" />
      <path d="M27 39 12 50l7 4 13-12" fill="currentColor" />
      <circle cx="19" cy="18" r="4" fill="currentColor" />
      <path d="M14 14h9l4 4h-8l-5-4z" fill="currentColor" opacity="0.9" />
      <path d="M36 18l9-8 8 5-9 11-8-8z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function KickboxingBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="22" cy="22" r="5" fill="currentColor" />
      <path d="M22 27v12l8 14 4-2-8-16 8-8 10 10 4-4-10-12-8 8-8-8-8 8z" fill="currentColor" />
      <path d="M35 18l14 8-4 5-12-9 2-4z" fill="currentColor" opacity="0.92" />
      <path d="M18 46h16l-5 10H11l7-10z" fill="currentColor" opacity="0.82" />
    </svg>
  );
}

function BrazilianJiuJitsuBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="18" cy="18" r="4.5" fill="currentColor" />
      <circle cx="42" cy="18" r="4.5" fill="currentColor" />
      <path d="M16 26c0-4 3-7 7-7h6c4 0 7 3 7 7v6h-20v-6zm24 0c0-4 3-7 7-7h6c4 0 7 3 7 7v6H40v-6z" fill="currentColor" opacity="0.9" />
      <path d="M18 36c0-3 2-6 5-7l9-4 8 5 6 5c3 2 5 5 5 9v7H18v-8z" fill="currentColor" />
      <path d="M32 38c0 3-3 5-7 5s-7-2-7-5 3-5 7-5 7 2 7 5z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 38c0 3 3 5 7 5s7-2 7-5-3-5-7-5-7 2-7 5z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function WrestlingBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="20" cy="18" r="4.5" fill="currentColor" />
      <circle cx="45" cy="20" r="4.5" fill="currentColor" />
      <path d="M20 24l-8 13 8 12 6-9 7 12 10-7-6-9 10-8-7-6-8 6-7-9z" fill="currentColor" />
      <path d="M16 36h12l7 9h14l-5 9H22l-9-12z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function StrengthCombatConditioningBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 18h24v8H20zm2 8h20v16c0 4-3 7-7 7h-6c-4 0-7-3-7-7V26zm8-10v-5h8v5" fill="currentColor" />
      <path d="M32 18v-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 35 28 26l5 8 9-15 7 6-11 18-7-6-8 12-7-9z" fill="currentColor" />
      <path d="M22 18h20v5H22z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function CrossTrainingBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 22c8 2 14 7 18 16 3-7 7-12 15-16-6 10-9 19-10 25-3-6-9-10-23-25z" fill="currentColor" />
      <path d="M52 22c-8 2-14 7-18 16-3-7-7-12-15-16 6 10 9 19 10 25 3-6 9-10 23-25z" fill="currentColor" opacity="0.9" />
      <path d="M28 13v38M18 20l10 12M46 20 36 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FunctionalFitnessBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 22h10v7H12zm32 0h10v7H44zm-18 5h12v8H26z" fill="currentColor" />
      <path d="M18 28h28v4H18zm-4 4h36v3H14zm10 7h16v4H24zm2 4h12v5H26z" fill="currentColor" opacity="0.9" />
      <path d="M32 16v18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 23l-4 8 8 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M48 23l4 8-8 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BodyToningBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 24c0-5 4-9 9-9h10c5 0 9 4 9 9v9c0 9-6 17-15 17s-15-8-15-17v-9zm10 12h8v-7h-8v7z" fill="currentColor" />
      <path d="M11 28h7v8h-7zm36 0h7v8h-7z" fill="currentColor" opacity="0.9" />
      <path d="M28 25h8v18h-8z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function YogaBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="18" r="4.2" fill="currentColor" />
      <path d="M19 27c8-6 18-6 26 0l-3 7H22l-3-7zm-2 12c8-5 17-7 28-4l-4 8H17l0-4zm9-7h10l5 10H22l5-10z" fill="currentColor" />
      <path d="M24 36c5 2 11 2 16 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 44c5-2 10-3 20-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PersonalTrainingBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="22" cy="17" r="4.5" fill="currentColor" />
      <circle cx="47" cy="19" r="4.5" fill="currentColor" />
      <path d="M22 22v13l-7 8 5 5 9-9 8 9 6-4-8-12 8-10H22zm24-3 7 4-5 9-8-6 6-7z" fill="currentColor" />
      <path d="M18 43h11l6-11H24l-6 11zm23 0h11l-5-9H38l3 9z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

const GLYPHS = {
  'mixed-martial-arts': MixedMartialArtsBadge,
  boxing: BoxingBadge,
  'muay-thai': MuayThaiBadge,
  kickboxing: KickboxingBadge,
  'brazilian-jiu-jitsu': BrazilianJiuJitsuBadge,
  wrestling: WrestlingBadge,
  'strength-combat-conditioning': StrengthCombatConditioningBadge,
  'cross-training': CrossTrainingBadge,
  'functional-fitness': FunctionalFitnessBadge,
  'body-toning': BodyToningBadge,
  yoga: YogaBadge,
  'personal-training': PersonalTrainingBadge,
  generic: GenericBadge,
};

export function slugFor(name) {
  const value = String(name ?? '').trim();
  const slug = NAME_TO_SLUG[value] || 'generic';
  if (!NAME_TO_SLUG[value] && import.meta.env.DEV) {
    console.warn(`[ProgramBadge] Unmatched program name: "${value}". Falling back to generic glyph.`);
  }
  return slug;
}

export function ProgramBadge({ name, size }) {
  const slug = slugFor(name);
  const Icon = GLYPHS[slug] || GenericBadge;
  const px = typeof size === 'number' ? `${size}px` : size;
  const style = px ? { width: px, height: px } : undefined;

  return (
    <span className="pbadge" style={style}>
      <Icon />
    </span>
  );
}
