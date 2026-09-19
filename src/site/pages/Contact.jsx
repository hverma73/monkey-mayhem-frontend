import { useState } from 'react';
import { PageHead, PhotoSlot } from '../components/bits.jsx';
import { faqs, site, wa } from '../siteData.js';
import { addLead, SOURCE_FORM } from '../leads.js';
import { useToast } from '../toast.jsx';

const INTERESTS = [
  'A free trial class',
  'MMA',
  'Boxing / Muay Thai',
  'BJJ / Wrestling',
  'Personal training',
  'Kids / beginners',
  'Pricing',
];

const EMPTY = { name: '', phone: '', email: '', interest: INTERESTS[0], message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  // Set when the enquiry couldn't be filed. We keep what they typed on screen
  // and offer WhatsApp instead — losing a real enquiry to a flaky connection is
  // the one failure this form must not have.
  const [failed, setFailed] = useState(false);
  // Honeypot. A real visitor never sees this field, so anything in it means a
  // bot filled every input it could find; the server drops those silently.
  const [trap, setTrap] = useState('');
  const toast = useToast();

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return; // double-tap / double-Enter guard
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name || !phone) {
      toast('Add your name and phone');
      return;
    }

    setBusy(true);
    setFailed(false);
    try {
      await addLead({
        name,
        phone,
        trap,
        email: form.email.trim(),
        interest: form.interest,
        message: form.message.trim(),
        source: SOURCE_FORM,
      });
      setForm(EMPTY);
      toast('Enquiry sent — we’ll be in touch');
    } catch {
      setFailed(true);
      toast("Couldn't send that — try WhatsApp");
    } finally {
      setBusy(false);
    }
  }

  // Everything they typed, ready to send over WhatsApp instead.
  const fallbackText =
    `Hi TMM, I'd like to enquire about: ${form.interest}.\n` +
    `Name: ${form.name}\nPhone: ${form.phone}` +
    (form.message.trim() ? `\n${form.message.trim()}` : '');

  return (
    <div className="wrap pg">
      <PageHead eyebrow="Get in touch" title="Contact & enquiry" />

      <div className="grid g2">
        <div className="panel r">
          <h3>Send an enquiry</h3>
          <div className="sub">We reply fast — or skip the form and WhatsApp us.</div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field row2">
              <div className="field">
                <label htmlFor="c-name">Name</label>
                <input
                  id="c-name"
                  className="input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="c-phone">Phone</label>
                {/* inputMode brings up the keypad on a phone, which is where
                    most of these are filled in. Deliberately NOT validated:
                    an odd-looking number still beats a lost enquiry, and the
                    console degrades gracefully when it can't be dialled. */}
                <input
                  id="c-phone"
                  className="input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={32}
                  placeholder="+91…"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input
                id="c-email"
                className="input"
                type="email"
                autoComplete="email"
                maxLength={160}
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="c-interest">I&rsquo;m interested in</label>
              <select
                id="c-interest"
                className="input"
                value={form.interest}
                onChange={(e) => set('interest', e.target.value)}
              >
                {INTERESTS.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="c-msg">Message</label>
              {/* maxLength matches the server's cap, so a long message stops
                  in the UI rather than arriving quietly truncated. */}
              <textarea
                id="c-msg"
                className="input"
                maxLength={2000}
                placeholder="Tell us your goal…"
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
              />
            </div>

            {/* Honeypot — hidden from people, irresistible to bots. Not
                type="hidden": some bots skip those. aria-hidden + tabIndex
                keep it away from screen readers and keyboard users. */}
            <div className="hp" aria-hidden="true">
              <label htmlFor="c-web">Website</label>
              <input
                id="c-web"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </div>

            <button className="btn btn-block" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send enquiry'}
            </button>

            {failed ? (
              <p className="note">
                That didn&rsquo;t go through — your connection or our server. Nothing&rsquo;s lost:{' '}
                <a
                  href={wa(fallbackText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  send it on WhatsApp instead
                </a>{' '}
                (we&rsquo;ve filled it in for you), or call {site.phone}.
              </p>
            ) : (
              <p className="note">
                This goes straight to the front desk — no email needed. We usually reply the same
                day.
              </p>
            )}
          </form>
        </div>

        <div className="panel r">
          <h3>Visit the gym</h3>
          <p style={{ marginBottom: 6, fontWeight: 600 }}>{site.address}</p>
          <p className="lv" style={{ marginBottom: 16 }}>{site.hours}</p>

          {/* The club's own interior shot, from their previous site — 570x442,
              so it is cropped to the wide slot rather than upscaled. */}
          <PhotoSlot
            label="Map / storefront — Kadri, Mangaluru"
            variant="wide"
            src="/photos/gym-floor.jpg"
            alt="The training floor at Monkey Mayhem Fight Club, Kadri"
          />

          <div className="actions" style={{ marginTop: 14 }}>
            <a className="btn btn-sm" target="_blank" rel="noopener noreferrer" href={site.maps}>
              Get directions
            </a>
            <a className="btn btn-sm btn-2" href={`tel:+${site.phoneRaw}`}>
              Call {site.phone}
            </a>
          </div>
          <div className="actions" style={{ marginTop: 10 }}>
            <a
              className="btn btn-sm btn-2"
              target="_blank"
              rel="noopener noreferrer"
              href={wa('Hi TMM, I have a question.')}
            >
              WhatsApp
            </a>
            <a className="btn btn-sm btn-2" href={`mailto:${site.email}`}>
              Email us
            </a>
          </div>
        </div>
      </div>

      <h2 className="h2 r" style={{ margin: '44px 0 18px' }}>
        Straight answers
      </h2>
      {faqs.map((f) => (
        <details className="acc r" key={f.q}>
          <summary>{f.q}</summary>
          <div className="acc-body">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
