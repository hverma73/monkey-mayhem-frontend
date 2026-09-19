// The club's real emblem — the same white monkey skull over a cracked
// pentagram that heads the invoice PDF (backend assets/logo.png, copied to
// public/logo.png so both surfaces show one mark).
//
// The artwork has its own black field baked in, so it's framed as a rounded
// badge: that reads as a patch on the dark site AND on the light console
// theme, instead of a stray black square.
export default function Logo({ size = 40, className = '' }) {
  return (
    <img
      className={`mm-logo ${className}`.trim()}
      src="/logo.png"
      width={size}
      height={size}
      alt="Monkey Mayhem Fight Club"
    />
  );
}
