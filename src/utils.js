// Format an ISO date (or null) as e.g. "14 Aug 2026".
export function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Colour class for the days-to-expiry number.
export function daysClass(days) {
  if (days == null) return '';
  if (days <= 3) return 'days crit';
  if (days <= 7) return 'days soon';
  return 'days ok';
}

// Human label for days-to-expiry.
export function daysLabel(days) {
  if (days == null) return '—';
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  return `${days}d`;
}

// Single source of truth for ₹ formatting (Indian grouping). null/blank → '—'.
export function formatMoney(value) {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

// "2 invoices" / "1 invoice" — count + noun, pluralised on anything but 1.
export function plural(count, noun) {
  const n = Number(count) || 0;
  return `${n} ${noun}${n === 1 ? '' : 's'}`;
}

// Build a prefilled WhatsApp click-to-chat link to a specific number. wa.me
// wants digits only, so '+', spaces and dashes are stripped; returns null when
// nothing dialable is left, so the caller can disable its button rather than
// open a chat with the wrong person (or nobody).
//
// This only chooses the RECIPIENT. WhatsApp sends from whichever account is
// signed in on the device that opens the link — so for replies to come from the
// club's number, the front desk has to be signed into the club's WhatsApp.
export function waTo(phone, text) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// Save a fetched Blob to disk by clicking a temporary object-URL link.
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0); // free blob memory
}
