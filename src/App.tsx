import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Feed from './pages/Feed';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

declare let ga: (...args: string[]) => void;

function AnalyticsTracker() {
    const location = useLocation();
    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);
    return null;
}

function AppContent() {
    const { settings } = useSettings();

    return (
        <BrowserRouter>
            <AnalyticsTracker />
            <div className={settings.theme}>
                <div className="body-cover" />
                <div className="wrapper">
                    <Header />
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed feedType="news" />} />
                        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                        <Route path="/show/:page" element={<Feed feedType="show" />} />
                        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                        <Route
                            path="/item/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <ItemDetails />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/user/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <User />
                                </Suspense>
                            }
                        />
                    </Routes>
                    <Footer />
                </div>
            </div>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <AppContent />
        </SettingsProvider>
    );
}
