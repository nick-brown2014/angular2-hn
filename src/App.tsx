import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services';
import { SettingsProvider } from './contexts/SettingsProvider';
import { useSettings } from './hooks/useSettings';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Loader } from './components/Loader/Loader';
import { Feed } from './pages/Feed/Feed';
import { SettingsPage } from './pages/Settings/SettingsPage';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails').then(({ ItemDetails: Component }) => ({ default: Component })));
const UserPage = lazy(() => import('./pages/User/User').then(({ UserPage: Component }) => ({ default: Component })));

declare function ga(...args: unknown[]): void;

function GATracker() {
    const location = useLocation();
    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);
    return null;
}

export function AppLayout() {
    const { settings } = useSettings();
    return <div className={settings.theme}><div className="body-cover" /><div className="wrapper"><Header /><Suspense fallback={<Loader />}><Routes>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        <Route path="/news/:page" element={<Feed feedType="news" />} />
        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
        <Route path="/show/:page" element={<Feed feedType="show" />} />
        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/user/:id" element={<UserPage />} />
        <Route path="/settings" element={<SettingsPage />} />
    </Routes></Suspense><Footer /></div></div>;
}

export default function App() {
    return <QueryClientProvider client={queryClient}><BrowserRouter><SettingsProvider><GATracker /><AppLayout /></SettingsProvider></BrowserRouter></QueryClientProvider>;
}
