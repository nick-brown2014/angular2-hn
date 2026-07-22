import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import './styles/global.scss';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const User = lazy(() => import('./components/User'));

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<Navigate to="/news/1" replace />} />
                        <Route path="news/:page" element={<Feed feedType="news" />} />
                        <Route path="newest/:page" element={<Feed feedType="newest" />} />
                        <Route path="show/:page" element={<Feed feedType="show" />} />
                        <Route path="ask/:page" element={<Feed feedType="ask" />} />
                        <Route path="jobs/:page" element={<Feed feedType="jobs" />} />
                        <Route
                            path="item/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <ItemDetails />
                                </Suspense>
                            }
                        />
                        <Route
                            path="user/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <User />
                                </Suspense>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </SettingsProvider>
    </StrictMode>
);
