import { Outlet } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import Header from './components/core/Header';
import Footer from './components/core/Footer';

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}
