import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/useSettings';
import Settings from './Settings';
import '../styles/Header.scss';

export default function Header() {
  const settings = useSettings();

  function scrollTop() {
    window.scrollTo(0, 0);
  }

  return (
    <header>
      <div id="header">
        <Link className="home-link" to="/news/1" onClick={scrollTop}>
          <div className="logo-inner" />
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </Link>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <Link to="/newest/1" onClick={scrollTop}>new</Link>
              {' | '}
              <Link to="/show/1" onClick={scrollTop}>show</Link>
              {' | '}
              <Link to="/ask/1" onClick={scrollTop}>ask</Link>
              {' | '}
              <Link to="/jobs/1" onClick={scrollTop}>jobs</Link>
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="/assets/images/cog.svg"
            alt="Settings"
            onClick={() => settings.toggleSettings()}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
