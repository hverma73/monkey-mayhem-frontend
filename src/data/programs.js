import { scheduleSummary } from './timetable.js';

const basePrograms = [
  ['Mixed Martial Arts', 'MMA', 'The whole fight: striking, takedowns, ground work and cage craft in one program.', 'All levels · Fight-team base', 'Coach Nithesh', 'Hi Monkey Mayhem, I\'d like to book a trial for Mixed Martial Arts.'],
  ['Boxing', 'Striking', 'Hands, footwork, head movement. The sweet science, drilled clean.', 'Beginners welcome', 'Striking team', 'Hi Monkey Mayhem, I\'d like to book a trial for Boxing.'],
  ['Muay Thai', 'Striking', 'Eight limbs — fists, elbows, knees, shins — and the clinch that ties them together.', 'All levels', 'Coach Nithesh', 'Hi Monkey Mayhem, I\'d like to book a trial for Muay Thai.'],
  ['Kickboxing', 'Striking', 'Punch-kick combinations built on footwork and a deep gas tank.', 'All levels', 'Striking team', 'Hi Monkey Mayhem, I\'d like to book a trial for Kickboxing.'],
  ['Brazilian Jiu-Jitsu', 'Grappling', 'Leverage over strength. Positions, sweeps, submissions.', 'Beginners welcome', 'Grappling team', 'Hi Monkey Mayhem, I\'d like to book a trial for Brazilian Jiu-Jitsu.'],
  ['Wrestling', 'Grappling', 'Takedowns, pins, top pressure — and the will to stay there.', 'All levels', 'Coach Navaraj', 'Hi Monkey Mayhem, I\'d like to book a trial for Wrestling.'],
  ['Strength & Combat Conditioning', 'Conditioning', 'Fight-specific strength: grip, hips, neck, lungs.', 'Everyone', 'S&C team', 'Hi Monkey Mayhem, I\'d like to book a trial for Strength & Combat Conditioning.'],
  ['Cross Training', 'Conditioning', 'Mixed-modal work for all-round athleticism.', 'Everyone', 'S&C team', 'Hi Monkey Mayhem, I\'d like to book a trial for Cross Training.'],
  ['Functional Fitness', 'Conditioning', 'Lift, carry, climb, sprint — strength that shows up everywhere.', 'Everyone', 'S&C team', 'Hi Monkey Mayhem, I\'d like to book a trial for Functional Fitness.'],
  ['Body Toning', 'Conditioning', 'Targeted sculpt-and-strength work for definition.', 'Everyone', 'S&C team', 'Hi Monkey Mayhem, I\'d like to book a trial for Body Toning.'],
  ['Yoga', 'Recovery', 'Mobility and breath — the recovery half of hard training.', 'Everyone', 'Recovery team', 'Hi Monkey Mayhem, I\'d like to book a trial for Yoga.'],
  ['Personal Training', '1-on-1', 'Private coaching in any discipline, built around your goals.', 'By appointment', 'Book the coaching team', 'Hi Monkey Mayhem, I\'d like to book a trial for Personal Training.'],
];

const slugify = (name) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const programs = basePrograms.map(([name, category, tagline, level, coach, whatsappText], index) => ({
  index: String(index + 1).padStart(2, '0'),
  slug: slugify(name),
  name,
  category,
  tagline,
  level,
  coach,
  whatsappText,
  ...scheduleSummary(name),
  ...(name === 'Mixed Martial Arts' ? { featured: true } : {}),
}));
