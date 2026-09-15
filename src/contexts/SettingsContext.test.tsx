import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider, useSettings } from './SettingsContext';

function Consumer() {
  const { settings, setFont } = useSettings();
  return (
    <>
      <span>{settings.theme}</span>
      <button onClick={() => setFont('20')}>font</button>
    </>
  );
}
const matchMedia = () => ({ matches: true, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() });

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn(matchMedia));
  });
  it('uses system dark mode without persisting it', () => {
    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );
    expect(screen.getByText('night')).toBeInTheDocument();
    expect(localStorage.getItem('theme')).toBeNull();
    fireEvent.click(screen.getByText('font'));
    expect(localStorage.getItem('titleFontSize')).toBe('20');
  });
  it('prefers a saved theme', () => {
    localStorage.setItem('theme', 'default');
    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );
    expect(screen.getByText('default')).toBeInTheDocument();
  });
});
