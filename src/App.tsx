import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Loader } from './components/Loader/Loader';
import { Feed } from './pages/Feed/Feed';
import './app.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails').then((module) => ({ default: module.ItemDetails })));
const User = lazy(() => import('./pages/User/User').then((module) => ({ default: module.User })));

declare global { interface Window { ga?: (...args: unknown[]) => void; } }

export function App() {
  const { settings } = useSettings(); const location = useLocation();
  useEffect(() => { window.ga?.('set', 'page', location.pathname); window.ga?.('send', 'pageview'); }, [location.pathname]);
  return <div className={settings.theme}><div className="body-cover" /><div className="wrapper"><Header /><Suspense fallback={<Loader />}><Routes><Route path="/" element={<Navigate to="/news/1" replace />} />{(['news','newest','show','ask','jobs'] as const).map((feed) => <Route key={feed} path={`/${feed}/:page`} element={<Feed feedType={feed} />} />)}<Route path="/item/:id" element={<ItemDetails />} /><Route path="/user/:id" element={<User />} /><Route path="*" element={<Navigate to="/news/1" replace />} /></Routes></Suspense><Footer /></div></div>;
}
