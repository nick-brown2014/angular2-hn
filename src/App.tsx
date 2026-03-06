import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/core/Header';
import Footer from './components/core/Footer';
import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import './styles/global.scss';
import './styles/components/app.scss';

const ItemDetails = React.lazy(() => import('./components/item-details/ItemDetails'));
const User = React.lazy(() => import('./components/user/User'));

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

function AppContent() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed feedType="news" />} />
                        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                        <Route path="/show/:page" element={<Feed feedType="show" />} />
                        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <GATracker />
                <AppContent />
            </BrowserRouter>
        </SettingsProvider>
    );
}
