import { Link } from 'react-router-dom';
import MonkeyMark from '../components/MonkeyMark.jsx';

export default function NotFound() {
  return (
    <div className="wrap pg" style={{ textAlign: 'center' }}>
      <MonkeyMark variant="badge" style={{ width: 110, height: 110, margin: '0 auto' }} />
      <h1 className="h2" style={{ margin: '16px 0 8px' }}>
        Page not found
      </h1>
      <p className="lead" style={{ margin: '0 auto 20px' }}>
        That one slipped the jab. Let&rsquo;s get you back.
      </p>
      <Link className="btn" to="/">
        Back to home
      </Link>
    </div>
  );
}
