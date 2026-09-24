import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settings: Settings;

  const story = (overrides: Partial<Story> = {}): Story => ({
    id: 1,
    title: 'Hello HN',
    points: 42,
    user: 'pg',
    time_ago: '2 hours ago',
    type: 'link',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments_count: 3,
    ...overrides
  } as Story);

  beforeEach(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };

    TestBed.configureTestingModule({
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.item = story();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  describe('hasUrl', () => {
    it('is true for http(s) urls', () => {
      component.item = story({ url: 'http://example.com' });
      expect(component.hasUrl).toBe(true);
      component.item = story({ url: 'https://example.com' });
      expect(component.hasUrl).toBe(true);
    });

    it('is false for internal item urls', () => {
      component.item = story({ url: 'item?id=1' });
      expect(component.hasUrl).toBe(false);
    });
  });

  it('renders an external link with the domain when the story has a url', () => {
    component.item = story();
    fixture.detectChanges();

    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(title.getAttribute('href')).toBe('https://example.com/post');
    expect(title.textContent.trim()).toBe('Hello HN');
    expect(title.getAttribute('target')).toBeNull();
    expect(fixture.nativeElement.querySelector('.domain').textContent).toBe('(example.com)');
  });

  it('opens external links in a new tab when the setting is enabled', () => {
    settings.openLinkInNewTab = true;
    component.item = story();
    fixture.detectChanges();

    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('renders a routerLink title without a domain for internal stories', () => {
    component.item = story({ url: 'item?id=1', domain: undefined });
    fixture.detectChanges();

    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(title.getAttribute('href')).toBeNull();
    expect(fixture.nativeElement.querySelector('.domain')).toBeNull();
  });

  it('applies title font size and list spacing from settings', () => {
    settings.titleFontSize = '20';
    settings.listSpacing = '12';
    component.item = story();
    fixture.detectChanges();

    const wrapper: HTMLElement = fixture.nativeElement.querySelector('div');
    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(wrapper.style.marginBottom).toBe('12px');
    expect(title.style.fontSize).toBe('20px');
  });

  it('renders points, user and comment count for non-job stories', () => {
    component.item = story();
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('42');
    expect(text).toContain('pg');
    expect(text).toContain('3 comments');
    expect(fixture.nativeElement.querySelector('.comment-number')).toBeTruthy();
  });

  it('hides points, user and comments for job posts', () => {
    component.item = story({ type: 'job', user: undefined, points: undefined, comments_count: 0 });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.comment-number')).toBeNull();
    expect(fixture.nativeElement.querySelector('.name')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('points by');
  });
});
