import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MonkeyMark from './components/MonkeyMark.jsx';
import { site, wa } from './siteData.js';
import { addLead, SOURCE_CHATBOT } from './leads.js';
import { useToast } from './toast.jsx';

/* =====================================================================
   Front-desk assistant. Scripted, not an LLM: quick-reply buttons answer
   the four questions the club actually gets asked, and the "trial" and
   "pricing" paths collect a name + number, which lands in the staff
   console's Leads page.
   ===================================================================== */

const GREETING = { role: 'bot', node: "👊 Hey! I'm the Monkey Mayhem assistant. What can I help you with?" };

const QUICK = [
  ['trial', 'Book a trial'],
  ['time', 'Timetable'],
  ['price', 'Pricing'],
  ['where', 'Location'],
  ['human', 'Talk to a human'],
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [draftText, setDraftText] = useState('');
  const [step, setStep] = useState('idle'); // idle → name → phone
  const [intent, setIntent] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [sending, setSending] = useState(false); // enquiry POST in flight
  const msgsRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();

  // Keep the transcript pinned to the newest message.
  useEffect(() => {
    const box = msgsRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function push(role, node) {
    setMessages((prev) => [...prev, { role, node }]);
  }

  function handleQuick(topic) {
    if (topic === 'trial') {
      setIntent('Trial');
      setStep('name');
      push('bot', "Awesome — let's get you a free trial. 🥊 What's your name?");
    } else if (topic === 'price') {
      setIntent('Pricing');
      setStep('name');
      push(
        'bot',
        "Rates depend on the program and duration. Leave your name and number and we'll send the current price list."
      );
    } else if (topic === 'time') {
      push(
        'bot',
        <>
          We run Mon–Sat, 6 AM–10 PM, morning and evening blocks.{' '}
          <Link to="/batches" onClick={() => setOpen(false)}>
            Open the full timetable →
          </Link>
        </>
      );
    } else if (topic === 'where') {
      push(
        'bot',
        <>
          We&rsquo;re on the 3rd floor, Nalapad Buildings, next to Kadri Dwara, Kadri, Mangaluru.{' '}
          <a target="_blank" rel="noopener noreferrer" href={site.maps}>
            Get directions →
          </a>
        </>
      );
    } else if (topic === 'human') {
      push(
        'bot',
        <>
          You&rsquo;ve got it — chat with a real human here:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={wa("Hi TMM, I'd like to talk to someone about training.")}
          >
            Open WhatsApp →
          </a>
        </>
      );
    }
    inputRef.current?.focus();
  }

  async function handleSend(e) {
    e?.preventDefault();
    const text = draftText.trim();
    if (!text || sending) return;
    setDraftText('');
    push('me', text);

    if (step === 'name') {
      setPendingName(text);
      setStep('phone');
      push('bot', `Thanks ${text}! What's the best phone number to reach you?`);
      return;
    }

    if (step === 'phone') {
      // Capture into locals and reset the flow BEFORE the round trip: a second
      // Enter then can't file the same lead twice, and the visitor can carry on
      // chatting while the request is in the air.
      const name = pendingName || 'New lead';
      const interest = intent || 'General';
      setStep('idle');
      setIntent('');
      setPendingName('');

      setSending(true);
      try {
        await addLead({ name, phone: text, interest, source: SOURCE_CHATBOT });
        push(
          'bot',
          <>
            You&rsquo;re on the list, {name}! 👊 Coach&rsquo;s team will reach out shortly. Want to
            talk now?{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={wa("Hi TMM, I just messaged the chatbot — I'd like to book a trial.")}
            >
              WhatsApp us →
            </a>
          </>
        );
        toast('Enquiry sent — the front desk will call you');
      } catch {
        // Nothing was saved anywhere, so hand the details straight to the club
        // rather than lose them with the failed request.
        push(
          'bot',
          <>
            Ah — I couldn&rsquo;t file that from here, the connection dropped. Send it straight to
            the front desk instead:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={wa(
                `Hi TMM, the chatbot couldn't save my details.\nName: ${name}\nPhone: ${text}\nInterested in: ${interest}`
              )}
            >
              Open WhatsApp →
            </a>
          </>
        );
        toast('Couldn’t send — WhatsApp us instead');
      } finally {
        setSending(false);
      }
      return;
    }

    push(
      'bot',
      "I can help with a trial, the timetable, pricing or our location — tap a button below and I'll sort you out."
    );
  }

  if (!open) {
    return (
      <button className="cbot-btn" onClick={() => setOpen(true)} aria-label="Chat with us">
        <MonkeyMark variant="round" />
        <span className="dot" />
      </button>
    );
  }

  return (
    <div className="cbot-panel" role="dialog" aria-label="Chat with Monkey Mayhem">
      <div className="cbot-head">
        <MonkeyMark variant="round" />
        <div>
          <div className="t">Monkey Mayhem</div>
          <div className="s">Auto-reply · usually replies in minutes</div>
        </div>
        <button className="x" onClick={() => setOpen(false)} aria-label="Close chat">
          ×
        </button>
      </div>

      <div className="cbot-msgs" ref={msgsRef}>
        {messages.map((m, i) => (
          <div className={`msg ${m.role === 'me' ? 'me' : 'bot'}`} key={i}>
            {m.node}
          </div>
        ))}
      </div>

      <div className="cbot-quick">
        {QUICK.map(([topic, label]) => (
          <button key={topic} onClick={() => handleQuick(topic)}>
            {label}
          </button>
        ))}
      </div>

      <form className="cbot-input" onSubmit={handleSend}>
        <input
          ref={inputRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Type a message…"
          autoComplete="off"
          aria-label="Message"
        />
        <button type="submit" aria-label="Send">
          ➤
        </button>
      </form>
    </div>
  );
}
