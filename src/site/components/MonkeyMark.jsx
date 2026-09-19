// The club's real emblem (public/logo.png — the same artwork the invoice PDF
// uses). `variant` picks the frame:
//
//   'badge'  (default) — rounded square, for the nav / footer brand lockup
//   'plain'            — no frame, for the hero watermark and the 404
//   'round'            — circle, for the chatbot launcher and its header
//
// The artwork ships with its own black field, so it needs no recolouring —
// which is why it's an <img> rather than the inline SVG this used to be.
export default function MonkeyMark({ variant = 'badge', className = '', ...rest }) {
  return (
    <img
      className={`mk mk-${variant} ${className}`.trim()}
      src="/logo.png"
      alt=""
      aria-hidden="true"
      {...rest}
    />
  );
}
