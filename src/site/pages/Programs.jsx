import { useSearchParams } from 'react-router-dom';
import { CtaStrip, PageHead, ProgramCard } from '../components/bits.jsx';
import { programs } from '../siteData.js';

export default function Programs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get('category') || 'All';
  const categories = ['All', 'Striking', 'Grappling', 'MMA', 'Conditioning', 'Recovery', '1-on-1'];
  const visiblePrograms = active === 'All' ? programs : programs.filter((program) => program.category === active);

  function chooseCategory(category) {
    const next = new URLSearchParams(searchParams);
    if (category === 'All') next.delete('category');
    else next.set('category', category);
    setSearchParams(next);
  }

  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="12 disciplines · one roof"
        title="The main card"
        lead="Striking, grappling, conditioning and recovery — pick a lane or run the whole card."
      />
      <div className="chips" role="group" aria-label="Filter programs">
        {categories.map((category) => (
          <button
            className="chip"
            key={category}
            type="button"
            aria-pressed={active === category}
            onClick={() => chooseCategory(category)}
          >
            {category === 'All' ? 'All 12' : category}
          </button>
        ))}
      </div>
      <div className="pr-list">
        {visiblePrograms.map((program) => <ProgramCard key={program.slug} program={program} mode="row" />)}
      </div>
      <CtaStrip
        title="Not sure where to start?"
        sub="Tell us your goal and we'll point you at the right class."
      />
    </div>
  );
}
