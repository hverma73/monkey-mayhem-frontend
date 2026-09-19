import { Route, Routes } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import Home from './pages/Home.jsx';
import Programs from './pages/Programs.jsx';
import Batches from './pages/Batches.jsx';
import Team from './pages/Team.jsx';
import Achievements from './pages/Achievements.jsx';
import Events from './pages/Events.jsx';
import { ArticleList, ArticlePost } from './pages/Articles.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

export function SiteRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/team" element={<Team />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/events" element={<Events />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:id" element={<ArticlePost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
