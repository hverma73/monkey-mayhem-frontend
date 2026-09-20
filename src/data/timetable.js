export const week = [
  { day: 'Mon', slots: [['06:00', 'Strength & Conditioning', 'All levels'], ['07:00', 'Boxing', 'Beginners'], ['18:00', 'Mixed Martial Arts', 'All levels'], ['19:00', 'Yoga', 'Open']] },
  { day: 'Tue', slots: [['06:00', 'Boxing', 'All levels'], ['07:00', 'Brazilian Jiu-Jitsu', 'Beginners'], ['18:00', 'Kickboxing', 'All levels'], ['19:00', 'Mixed Martial Arts', 'Fight team']] },
  { day: 'Wed', slots: [['06:00', 'Strength & Combat Conditioning', 'All levels'], ['07:00', 'Kickboxing', 'All levels'], ['18:00', 'Wrestling', 'All levels'], ['19:00', 'Boxing', 'Beginners']] },
  { day: 'Thu', slots: [['06:00', 'Muay Thai', 'All levels'], ['07:00', 'Wrestling', 'All levels'], ['18:00', 'Mixed Martial Arts', 'All levels'], ['19:00', 'Yoga', 'Open']] },
  { day: 'Fri', slots: [['06:00', 'Functional Fitness', 'All levels'], ['07:00', 'Mixed Martial Arts', 'All levels'], ['18:00', 'Brazilian Jiu-Jitsu', 'All levels'], ['19:00', 'Strength & Combat Conditioning', 'All levels']] },
  { day: 'Sat', slots: [['07:00', 'Mixed Martial Arts', 'All levels'], ['08:00', 'Sparring', 'Invite'], ['17:00', 'Brazilian Jiu-Jitsu', 'All levels'], ['19:00', 'Open Mat', 'Open']] },
];

export function scheduleFor(name) {
  return week.flatMap(({ day, slots }) => slots
    .filter(([, program]) => program === name)
    .map(([time]) => ({ day, time })));
}

export function scheduleSummary(name) {
  const sessions = scheduleFor(name);
  return {
    days: [...new Set(sessions.map(({ day }) => day))].join(' · ') || 'By appointment',
    times: [...new Set(sessions.map(({ time }) => time))].join(' · ') || 'Flexible',
  };
}
