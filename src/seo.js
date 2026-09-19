export const SEO_ROUTES = {
  '/': {
    title: 'MMA, Boxing & Muay Thai Gym in Mangaluru (Mangalore) | Monkey Mayhem',
    description:
      'Monkey Mayhem Fight Club in Kadri, Mangaluru offers MMA, boxing, Muay Thai, BJJ, wrestling, conditioning and yoga for beginners to competitors.',
    canonical: 'https://monkeymayhemfightclub.com/',
  },
  '/programs': {
    title: 'Combat Sports Classes in Mangalore – 12 Disciplines | Monkey Mayhem Kadri',
    description:
      'Explore 12 combat sports and fitness disciplines at Monkey Mayhem in Kadri, Mangaluru, from MMA and boxing to yoga and personal training.',
    canonical: 'https://monkeymayhemfightclub.com/programs',
  },
  '/batches': {
    title: 'Class Timetable & Batches – Kadri, Mangaluru | Monkey Mayhem',
    description:
      'Check the weekly training timetable and class batches at Monkey Mayhem in Kadri, Mangaluru for MMA, boxing, BJJ and conditioning.',
    canonical: 'https://monkeymayhemfightclub.com/batches',
  },
  '/contact': {
    title: 'Book a Free Trial – Fight Gym in Kadri, Mangaluru | Monkey Mayhem',
    description:
      'Book a free trial at Monkey Mayhem Fight Club in Kadri, Mangaluru. Ask about classes, coaching and combat-sports training.',
    canonical: 'https://monkeymayhemfightclub.com/contact',
  },
  '/team': {
    title: 'Coaches & Team | Monkey Mayhem Kadri, Mangaluru',
    description:
      'Meet the coaches and team at Monkey Mayhem Fight Club in Kadri, Mangaluru.',
    canonical: 'https://monkeymayhemfightclub.com/team',
  },
  '/achievements': {
    title: 'Wins & Achievements | Monkey Mayhem Mangaluru',
    description:
      'See the achievements and competitive milestones from Monkey Mayhem Fight Club in Mangaluru.',
    canonical: 'https://monkeymayhemfightclub.com/achievements',
  },
  '/events': {
    title: 'Events & Open Days | Monkey Mayhem Mangaluru',
    description:
      'Upcoming events, open days and training experiences at Monkey Mayhem in Mangaluru.',
    canonical: 'https://monkeymayhemfightclub.com/events',
  },
  '/articles': {
    title: 'Training Articles & Guides | Monkey Mayhem',
    description:
      'Read beginner guides and training notes from Monkey Mayhem Fight Club in Mangaluru.',
    canonical: 'https://monkeymayhemfightclub.com/articles',
  },
  '/login': {
    title: 'Staff Login | Monkey Mayhem',
    description: 'Staff login for the Monkey Mayhem admin console.',
    canonical: 'https://monkeymayhemfightclub.com/login',
    noindex: true,
  },
};

export function getSeoMeta(pathname) {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/?$/, '');
  return SEO_ROUTES[normalized] || SEO_ROUTES['/'];
}
