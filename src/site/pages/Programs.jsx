import { CtaStrip, PageHead, ProgramCard } from '../components/bits.jsx';
import { programs } from '../siteData.js';

export default function Programs() {
  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="12 disciplines · one roof"
        title="The main card"
        lead="Striking, grappling, conditioning and recovery — pick a lane or run the whole card."
      />
      <div className="grid g-auto">
        {programs.map((p) => (
          <ProgramCard key={p.name} program={p} />
        ))}
      </div>
      <CtaStrip
        title="Not sure where to start?"
        sub="Tell us your goal and we'll point you at the right class."
      />
    </div>
  );
}
