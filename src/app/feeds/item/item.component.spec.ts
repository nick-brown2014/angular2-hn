import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Settings } from '../../shared/models/settings';
import { createSettingsServiceStub, makeSettings, makeStory, StoryOverrides } from '../../../testing/mocks';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let el: HTMLElement;
  let settings: Settings;

  function render(story: StoryOverrides = {}) {
    fixture.componentInstance.item = makeStory(story);
    fixture.detectChanges();
  }

  function text(selector: string): string {
    return el.querySelector(selector).textContent.replace(/\s+/g, ' ').trim();
  }

  beforeEach(() => {
    settings = makeSettings();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: createSettingsServiceStub(settings) }],
    });
    fixture = TestBed.createComponent(ItemComponent);
    el = fixture.nativeElement;
  });

  describe('story with an external URL', () => {
    beforeEach(() => render({ id: 7, title: 'Show HN: A thing', url: 'https://example.com/a', domain: 'example.com' }));

    it('links the title to the external URL', () => {
      const title: HTMLAnchorElement = el.querySelector('a.title');
      expect(fixture.componentInstance.hasUrl).toBe(true);
      expect(title.textContent.trim()).toBe('Show HN: A thing');
      expect(title.getAttribute('href')).toBe('https://example.com/a');
    });

    it('shows the domain', () => {
      expect(text('.domain')).toBe('(example.com)');
    });

    it('opens in the same tab by default', () => {
      const title: HTMLAnchorElement = el.querySelector('a.title');
      expect(title.hasAttribute('target')).toBe(false);
      expect(title.hasAttribute('rel')).toBe(false);
    });
  });

  it('opens external links in a new tab when that setting is on', () => {
    settings.openLinkInNewTab = true;
    render();
    const title: HTMLAnchorElement = el.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('links self posts (no external URL) to the item page', () => {
    render({ id: 5, title: 'Ask HN: Why?', url: 'item?id=5', domain: undefined });
    const title: HTMLAnchorElement = el.querySelector('a.title');

    expect(fixture.componentInstance.hasUrl).toBe(false);
    expect(title.getAttribute('href')).toBe('/item/5');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('renders points and the author linked to their profile', () => {
    render({ points: 128, user: 'dang' });

    expect(text('.subtext-laptop')).toContain('128 points by dang');
    expect(text('.subtext-palm .right')).toBe('128 ★');
    const userLinks = Array.from(el.querySelectorAll('a')).filter(a => a.textContent.trim() === 'dang');
    expect(userLinks.length).toBe(2);
    userLinks.forEach(a => expect(a.getAttribute('href')).toBe('/user/dang'));
  });

  it('renders the comment count linked to the item page', () => {
    render({ id: 9, comments_count: 5 });
    const link: HTMLAnchorElement = el.querySelector('.subtext-laptop .item-details a');
    expect(link.textContent.trim()).toBe('5 comments');
    expect(link.getAttribute('href')).toBe('/item/9');
    expect(text('.subtext-palm .comment-number')).toBe('• 5 comments');
  });

  it('uses the singular and "discuss" for small comment counts', () => {
    render({ comments_count: 1 });
    expect(text('.subtext-laptop .item-details a')).toBe('1 comment');

    fixture.componentInstance.item.comments_count = 0;
    fixture.detectChanges();
    expect(text('.subtext-laptop .item-details a')).toBe('discuss');
  });

  it('renders the relative time from the API', () => {
    render({ time_ago: '5 minutes ago' });
    expect(text('.subtext-laptop')).toContain('5 minutes ago');
    expect(text('.subtext-palm')).toContain('5 minutes ago');
  });

  it('omits points, author and comments for job posts', () => {
    render({ type: 'job', time_ago: '2 days ago' });
    expect(text('.subtext-laptop')).toBe('2 days ago');
    expect(el.querySelector('.comment-number')).toBeNull();
    expect(el.querySelector('.subtext-laptop .item-details')).toBeNull();
  });

  it('applies the title font size and list spacing settings', () => {
    settings.titleFontSize = '22';
    settings.listSpacing = '9';
    render();
    expect((el.querySelector('a.title') as HTMLElement).style.fontSize).toBe('22px');
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('9px');
  });
});
