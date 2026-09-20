import { waTo } from '../utils.js';
import { programs } from '../data/programs.js';
import { week } from '../data/timetable.js';

export { programs, week };

/* =====================================================================
   PUBLIC SITE CONTENT — every word the marketing site shows lives here.
   Ported from the Fight Night UI prototype so copy can be edited in one
   place without touching a component. The admin console (behind /login)
   reads its data from the API instead; this file is static content.
   ===================================================================== */

export const site = {
  name: 'Monkey Mayhem',
  full: 'Monkey Mayhem Fight Club',
  tagline: "Mangaluru's fight & fitness house since 2017.",
  est: '2017',
  phone: '+91 63649 08005',
  phoneRaw: '916364908005',
  email: 'info@monkeymayhemfightclub.com',
  address:
    '3rd floor, Nalapad Buildings, next to Kadri Dwara, Kadri, Mangaluru, Karnataka 575002',
  hours: 'Mon–Sat · 6 AM – 10 PM · Sun closed',
  maps: 'https://goo.gl/maps/yTxq2ETmT2t65RMr6',
  insta: 'https://www.instagram.com/monkey_mayhem_fight_club/',
  fb: 'https://www.facebook.com/monkeymayhemfightclub/',
  yt: 'https://youtube.com/@monkeymayhemfightclub5465',
  // Shown in the hero, the ticker and the reviews heading. These are STATIC
  // and unverified — no Google-sourced figure could be confirmed for the
  // listing, and Google Maps cannot be read by a crawler. When the backend has
  // GOOGLE_MAPS_API_KEY + GOOGLE_PLACE_ID set, the live rating and count
  // replace them everywhere and these become the pre-load fallback. Until then,
  // check them against the club's own Google listing by hand.
  rating: '4.9',
  reviews: '167',
};

export const stats = [
  { n: '600+', l: 'Members trained' },
  { n: '50', l: 'Fight-team athletes' },
  { n: '120', l: 'Titles & medals' },
  { n: '9', l: 'Years in Mangaluru' },
];

/* Named batches for enrolment + a full weekly grid. */
export const batches = [
  {
    name: 'Early Grind',
    time: '6:00 – 7:00 AM',
    days: 'Mon · Wed · Fri',
    focus: 'Strength & Conditioning',
    coach: 'Coach Nithesh',
    spots: '6 spots left',
    level: 'All levels',
  },
  {
    name: 'Sunrise Striking',
    time: '7:00 – 8:30 AM',
    days: 'Tue · Thu · Sat',
    focus: 'Boxing / Muay Thai',
    coach: 'Striking team',
    spots: 'Open',
    level: 'All levels',
  },
  {
    name: 'Evening Beginners',
    time: '6:00 – 7:30 PM',
    days: 'Mon – Fri',
    focus: 'Fundamentals + MMA',
    coach: 'Coach Nithesh',
    spots: 'Filling fast',
    level: 'Beginners',
  },
  {
    name: 'Fight Team',
    time: '7:00 – 9:00 PM',
    days: 'Tue · Thu',
    focus: 'Pro MMA / sparring',
    coach: 'Coach Nithesh',
    spots: 'By invite',
    level: 'Advanced',
  },
  {
    name: 'Weekend Warriors',
    time: '5:00 – 6:30 PM',
    days: 'Sat',
    focus: 'BJJ + open mat',
    coach: 'Grappling team',
    spots: 'Open',
    level: 'All levels',
  },
];

export const team = [
  {
    name: 'Nithesh Kumar',
    alias: 'The Vintage Monkey',
    role: 'Head Coach & Founder',
    tags: ['MMA', 'Muay Thai'],
    bio: 'Opened TMM in 2017 with a single mat and one rule: technique before bravado. Still teaches the fundamentals class himself.',
    real: true,
  },
  {
    name: 'Navaraj',
    alias: '',
    role: 'Wrestling Coach',
    tags: ['Wrestling'],
    bio: 'Takedowns and top pressure. Turns nervous beginners into people who chain shots.',
    real: true,
  }
];

export const achievements = [
  {
    year: '2024',
    title: 'State MMA medal haul',
    detail:
      'Fighters from the team placed across multiple weight classes at the state championships.',
  },
  {
    year: '2023',
    title: 'International presence',
    detail:
      'The first fight club in Mangaluru to send athletes to compete on the international stage.',
  },
  {
    year: '2022',
    title: '50-fighter team',
    detail:
      'Crossed 50 active competitive athletes training out of the Kadri gym.',
  },
  {
    year: '2021',
    title: 'Amateur boxing podiums',
    detail: 'Multiple district and state boxing podium finishes for TMM members.',
  },
  {
    year: '2019',
    title: 'Grassroots growth',
    detail:
      'Passed 300 members trained, expanding from striking into full MMA and grappling.',
  },
  {
    year: '2017',
    title: 'TMM opens in Kadri',
    detail:
      'Monkey Mayhem Fight Club is founded on a single mat, next to Kadri Dwara.',
  },
];

export const events = [
  {
    date: 'SAT · 14 SEP',
    title: 'Open Day & Free Trial',
    type: 'Open Day',
    blurb:
      'Bring a friend. Watch a class, hit the pads, meet the coaches. Zero pressure.',
    cta: 'Reserve a spot',
  },
  {
    date: 'SUN · 29 SEP',
    title: 'In-house Grading',
    type: 'Grading',
    blurb:
      'Members test up a level across BJJ and Muay Thai. Family and friends welcome to watch.',
    cta: 'Ask about eligibility',
  },
  {
    date: 'SAT · 12 OCT',
    title: 'Inter-gym Sparring Meet',
    type: 'Competition',
    blurb:
      'Controlled sparring against visiting gyms. Fight-team and advanced members only.',
    cta: 'Talk to your coach',
  },
  {
    date: 'SUN · 27 OCT',
    title: 'Strength & Recovery Seminar',
    type: 'Seminar',
    blurb:
      'A half-day on conditioning, mobility and injury-proofing your training.',
    cta: 'Save my seat',
  },
];

export const posts = [
  {
    id: 'first-month',
    title: 'Your first month at a fight gym: what actually happens',
    date: '12 Aug 2026',
    author: 'Coach Nithesh',
    cat: 'Beginners',
    read: '5 min',
    excerpt:
      "Nervous about walking in? Here's the honest week-by-week of starting from zero — no experience, no gear, no problem.",
    body: [
      'The hardest round is the one before you arrive. Almost everyone who walks into TMM for the first time is nervous, and almost everyone is surprised by how quickly that fades.',
      'Week one is about the basics: how to wrap your hands, how to move your feet, how to breathe under light effort. Nobody is going to throw you into sparring. Fundamentals get signed off before intensity gets loaded — that order never changes.',
      'By week three, most beginners are drilling combinations, holding pads for a partner, and starting to feel the engine build. Pros on the team share the same floor, and they warm up alongside first-timers with zero bias. That culture is the point.',
      "What to bring: comfortable kit, water, a towel. Don't buy gloves yet — train a few sessions, then sort your gear once you know what you're doing. Everything else, we'll teach you.",
    ],
  },
  {
    id: 'striking-vs-grappling',
    title: 'Striking or grappling: which should a beginner start with?',
    date: '2 Aug 2026',
    author: 'TMM Coaches',
    cat: 'Training',
    read: '4 min',
    excerpt:
      "Boxing and Muay Thai, or BJJ and wrestling? A simple way to choose your first discipline — or why you don't have to.",
    body: [
      'New members often ask whether to begin with striking or grappling. The honest answer: either is a great start, and MMA eventually asks for both.',
      'Striking — boxing, Muay Thai, kickboxing — builds coordination, footwork and confidence fast, and the cardio hit is immediate. If you want to feel athletic quickly, start here.',
      "Grappling — BJJ and wrestling — rewards patience and problem-solving. It's a chess match on the mat, and it's the most reliable route to real self-defence for most people.",
      'The good news: your membership opens the whole card. Try a striking class and a grappling class in your first week, and let your body tell you where it wants to be.',
    ],
  },
  {
    id: 'training-through-injury',
    title: 'Training smart: coming back from injury',
    date: '22 Jul 2026',
    author: 'Coach Nithesh',
    cat: 'Recovery',
    read: '6 min',
    excerpt:
      "One of our members came back from a herniated disc stronger than before. Here's the mindset and the method.",
    body: [
      "A member once came to us recovering from a herniated disc, unsure if he'd ever train hard again. Four months later he was training pain-free — stronger than before the injury.",
      'The method is not heroics. It’s honest communication with your coach, scaling load intelligently, and treating mobility and recovery as training, not as an afterthought.',
      "Yoga and dedicated conditioning aren't the soft option — they're the half of the work that keeps the hard half sustainable. Every serious fighter on the team does both.",
      "If you're carrying an old injury, tell us on day one. We'll build around it, not ignore it.",
    ],
  },
  {
    id: 'why-mangaluru',
    title: 'Why Mangaluru is quietly building real fighters',
    date: '10 Jul 2026',
    author: 'TMM',
    cat: 'Culture',
    read: '3 min',
    excerpt:
      "Coastal Karnataka has a fighting culture older than any gym. Here's how TMM fits into it.",
    body: [
      'This coast has raised fighters for a long time. The discipline is in the water here — you just need a room to channel it.',
      'TMM opened in Kadri in 2017 to be that room: a place where a curious beginner and a competitive pro can train under the same roof, to the same standard.',
      'Nine years on, with 600+ members trained and a 50-fighter team, the room got a lot louder. The standard didn’t move.',
    ],
  },
];

export const tutorials = [
  {
    id: 'handwrap',
    title: 'How to wrap your hands',
    discipline: 'Boxing',
    level: 'Beginner',
    minutes: '6 min',
    summary:
      'Protect your wrists and knuckles before every striking session. Do this once and it becomes muscle memory.',
    steps: [
      'Anchor the loop on your thumb and take the wrap across the back of your hand.',
      'Three turns around the wrist for support.',
      'Three turns around the knuckles, keeping the wrap flat.',
      'Cross through the fingers to spread the padding.',
      'Lock the wrist again and secure the velcro — snug, not cutting off circulation.',
    ],
  },
  {
    id: 'jab',
    title: 'The jab: your most important punch',
    discipline: 'Boxing',
    level: 'Beginner',
    minutes: '8 min',
    summary:
      'The jab measures distance, sets up everything, and keeps you safe. Drill it more than anything else.',
    steps: [
      'Hands up, chin down, weight balanced on the balls of your feet.',
      'Extend the lead hand straight, turning the fist over at the end.',
      'Keep the rear hand glued to your cheek as a shield.',
      'Snap it back the way it came — never drop it after.',
      'Add a small step to close distance, then reset.',
    ],
  },
  {
    id: 'shrimp',
    title: 'Hip escape (shrimping) for BJJ',
    discipline: 'BJJ',
    level: 'Beginner',
    minutes: '5 min',
    summary:
      'The single most important movement in jiu-jitsu. It creates space and gets you out from underneath.',
    steps: [
      'Lie on your back, feet flat, knees bent.',
      'Turn to one side, framing with your arms.',
      'Push off the floor with your foot and slide your hips away.',
      'Reset flat and repeat on the other side.',
      'Chain several escapes together, travelling across the mat.',
    ],
  },
  {
    id: 'teep',
    title: 'The teep (push kick) in Muay Thai',
    discipline: 'Muay Thai',
    level: 'Beginner',
    minutes: '7 min',
    summary:
      "Your long-range stop sign. The teep controls distance and interrupts an opponent's rhythm.",
    steps: [
      'From your stance, lift the lead knee high.',
      'Extend the leg, striking with the ball of the foot.',
      'Push through the target rather than snapping.',
      'Recoil the leg fast to avoid it being caught.',
      'Return to a balanced stance, hands up.',
    ],
  },
  {
    id: 'sprawl',
    title: 'The sprawl: stopping the takedown',
    discipline: 'Wrestling',
    level: 'Beginner',
    minutes: '5 min',
    summary:
      'When someone shoots for your legs, the sprawl is your first line of defence.',
    steps: [
      'React to the shot by kicking both legs back and down.',
      "Drop your hips heavy onto the opponent's shoulders.",
      'Underhook or cross-face to control the head.',
      'Circle away to a safe angle.',
      'Come back up to your stance, ready to reset.',
    ],
  },
];

/* Member quotes shown on the site, and the fallback whenever live Google
   reviews are unavailable (no API key set, or Google unreachable).

   PROVENANCE IS PART OF THE DATA. These are presented to visitors as real
   reviews, so each entry records where it actually came from. Two groups:

   * `href` set — traceable. The four NAMED entries all appear in the
     testimonials block of the club's previous website, which deep-linked each
     one to its source. Those links still resolve: three go to reviews on the
     club's own Google Maps listing (place 0x619628efb9691cd9) and one to a
     public Facebook post. QuoteCard renders the link so a reader can check it.

     Caveat the club should settle: only Iye Shah's quote is verbatim. The other
     three are tightened rewrites of the original review text, and Aniruddha
     Sharma's adds an outcome ("training pain-free — stronger than before the
     injury") that is not visible in the source excerpt. Words put in a named
     person's mouth should match what they wrote — worth checking each against
     the linked review and correcting here.

   * `verified: false` — NOT traceable. The four anonymous entries have no
     author, no permalink and no counterpart on any public surface: absent from
     the club's old site, and exact-phrase searches for their wording return
     nothing. That is not proof they are invented — Google review pages are
     JavaScript-only and a crawler cannot read the club's full review corpus —
     but nothing found supports labelling them "Google review". Either replace
     each with a real review copied from the club's own Google listing, adding
     the reviewer's name and permalink, or remove them. They are flagged rather
     than deleted because that is the club's call, not the code's.

   Setting GOOGLE_MAPS_API_KEY and GOOGLE_PLACE_ID on the backend makes the
   homepage prefer live Google reviews and demotes this list to the fallback. */
export const testimonials = [
  {
    q: "I came in recovering from a herniated disc. Four months with Nithesh sir and I'm training pain-free — stronger than before the injury.",
    who: 'Aniruddha Sharma',
    role: 'Sales manager · Dubai',
    src: 'Google',
    href: 'https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChZDSUhNMG9nS0VJQ0FnSUNPenBqbkNnEAE!2m1!1s0x0:0x619628efb9691cd9!3m1!1s2@1:CIHM0ogKEICAgICOzpjnCg%7CCgwIvvaMlQYQyLWMogM%7C?hl=en',
  },
  {
    q: 'The best fight club in the whole of Karnataka. Monkey Mayhem will turn anyone into a fighter.',
    who: 'Iye Shah',
    role: 'Businesswoman',
    src: 'Facebook',
    href: 'https://www.facebook.com/aishghlb/posts/pfbid0q48jqvbXsJKAz79nn3pjTfxz4M1SGDJCXrim2kf7Qmsi5ucgM2yKieSM1rDYXtcql',
  },
  {
    q: 'Best fighting and fitness centre, no second thoughts. Still a #TMM member, even from Saudi.',
    who: 'Abdulla Abby',
    role: 'Mechanical engineer',
    src: 'Google',
    href: 'https://goo.gl/maps/XHfR4RPV4mvjy17w6',
  },
  {
    q: 'A place that actually teaches the dedication behind martial arts — not just the workout.',
    who: 'Rahul Nayak',
    role: 'Student',
    src: 'Google',
    href: 'https://g.co/kgs/23uZe1',
  },

  /* --- unverified: no author, no permalink, no public source found --- */
  {
    q: "I joined as a complete beginner, but I've learned so many techniques and fundamentals here. Coach Nithesh's guidance, patience, and teaching style make learning easy and motivating.",
    who: 'Google review',
    role: '5★ · 2026',
    src: 'Google',
    verified: false,
  },
  {
    q: 'Pro fighters warm up and train alongside beginners with zero bias. If your goal is to eventually step into a real fight, they genuinely help you get there.',
    who: 'Google review',
    role: '5★ · 2026',
    src: 'Google',
    verified: false,
  },
  {
    q: 'Considered one of the best fight training gyms in South India. If you are serious about boxing or MMA, highly recommended.',
    who: 'Google review',
    role: '5★ · 2026',
    src: 'Google',
    verified: false,
  },
  {
    q: "The sessions keep my mind fresh and my body agile. It's a great place to train, grow, and stay consistent.",
    who: 'Google review',
    role: '5★ · 2026',
    src: 'Google',
    verified: false,
  },
];

/* The quotes with a resolvable source, most useful first. The homepage shows
   these when live Google reviews are unavailable, so the fallback leads with
   what can actually be stood behind. */
export const verifiedTestimonials = testimonials.filter((t) => t.verified !== false);

export const faqs = [
  {
    q: 'Do I need any experience?',
    a: 'None. Most members start from zero. Fundamentals come first, and pros share the floor with first-timers.',
  },
  {
    q: 'I just want fitness, not fights. Is that OK?',
    a: 'Completely. Most of the floor trains for fitness — the fight team is an opt-in track, never a requirement.',
  },
  {
    q: 'What should I bring?',
    a: "Comfortable kit, water and a towel. Don't buy gloves yet — sort your gear after the first class.",
  },
  {
    q: 'How much does it cost?',
    a: "Rates depend on the program and duration. Send us a WhatsApp message and we'll share the current price list.",
  },
  {
    q: 'Where exactly are you?',
    a: '3rd floor, Nalapad Buildings, next to Kadri Dwara, Kadri, Mangaluru 575002 — one landmark, easy to find.',
  },
  {
    q: 'How do I start?',
    a: "Book a trial on WhatsApp or call. We'll slot you into a beginner-friendly class this week.",
  },
];

/* Build a prefilled WhatsApp link TO THE CLUB — what every button on the
   public site wants ("Book a trial", "WhatsApp us", "Enrol / ask"). The staff
   console answers enquirers instead, so it calls waTo() directly.

   site.phoneRaw is already digits-only, so this produces the same string it
   always did. */
export function wa(text) {
  return waTo(site.phoneRaw, text);
}
