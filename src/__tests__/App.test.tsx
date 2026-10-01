import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // The app should render with the header containing navigation links
        expect(screen.getByText('new')).toBeDefined();
        expect(screen.getByText('show')).toBeDefined();
        expect(screen.getByText('ask')).toBeDefined();
        expect(screen.getByText('jobs')).toBeDefined();
    });
});
