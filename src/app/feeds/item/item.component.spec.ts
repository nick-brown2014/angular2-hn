import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettingsServiceSpy, makeSettings, makeStory, StoryFixture } from '../../../testing/mocks';

@Component({ template: '' })
class BlankComponent {}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let el: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  function render(story: StoryFixture = {}) {
    fixture.componentInstance.item = makeStory(story);
    fixture.detectChanges();
  }

  function title(): HTMLAnchorElement {
    return el.querySelector('a.title');
  }

  function laptopText(): string {
    return el.querySelector('.subtext-laptop').textContent.replace(/\s+/g, ' ').trim();
  }

  beforeEach(() => {
    settingsService = createSettingsServiceSpy(makeSettings({ titleFontSize: '20', listSpacing: '7' }));
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', component: BlankComponent }]), PipesModule],
      declarations: [ItemComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });
    fixture = TestBed.createComponent(ItemComponent);
    el = fixture.nativeElement;
  });

  describe('stories with an external URL', () => {
    beforeEach(() => render({ id: 9, title: 'Show HN: Thing', url: 'https://thing.dev/x', domain: 'thing.dev' }));

    it('links the title to the external URL and shows the domain', () => {
      expect(fixture.componentInstance.hasUrl).toBe(true);
      expect(title().textContent.trim()).toBe('Show HN: Thing');
      expect(title().getAttribute('href')).toBe('https://thing.dev/x');
      expect(el.querySelector('.domain').textContent).toBe('(thing.dev)');
    });

    it('opens in the same tab by default', () => {
      expect(title().hasAttribute('target')).toBe(false);
      expect(title().hasAttribute('rel')).toBe(false);
    });

    it('opens in a new tab with rel=noopener when the setting is on', () => {
      settingsService.settings.openLinkInNewTab = true;
      fixture.detectChanges();

      expect(title().getAttribute('target')).toBe('_blank');
      expect(title().getAttribute('rel')).toBe('noopener');
    });
  });

  it('hides the domain when the API sends none', () => {
    render({ domain: undefined });
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('links the title to the item page for self posts (relative URL)', () => {
    render({ id: 321, title: 'Ask HN: Why?', url: 'item?id=321', domain: undefined });

    expect(fixture.componentInstance.hasUrl).toBe(false);
    expect(title().getAttribute('href')).toBe('/item/321');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('applies the font size and list spacing settings', () => {
    render();

    expect(title().style.fontSize).toBe('20px');
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('7px');
  });

  it('shows points, author, time and comment count for stories', () => {
    render({ id: 5, points: 99, user: 'tptacek', time_ago: '2 hours ago', comments_count: 12 });

    expect(laptopText()).toBe('99 points by tptacek 2 hours ago | 12 comments');
    expect(el.querySelector('.subtext-palm .right').textContent).toBe('99 ★');
    expect(el.querySelector('.subtext-laptop a[href="/user/tptacek"]')).not.toBeNull();
    expect(el.querySelector('.subtext-laptop a[href="/item/5"]').textContent.trim()).toBe('12 comments');
    expect(el.querySelector('.subtext-palm .comment-number').textContent).toContain('12 comments');
  });

  it('formats the comment count with the comment pipe', () => {
    render({ comments_count: 1 });
    expect(laptopText()).toContain('| 1 comment');

    fixture.componentInstance.item = makeStory({ comments_count: 0 });
    fixture.detectChanges();
    expect(laptopText()).toContain('| discuss');
  });

  it('hides author, points and comments for jobs', () => {
    render({ type: 'job', time_ago: '1 day ago' });

    expect(laptopText()).toBe('1 day ago');
    expect(el.querySelector('.name')).toBeNull();
    expect(el.querySelector('.comment-number')).toBeNull();
    expect(el.querySelector('.item-details')).toBeNull();
  });

  it('navigates to the author profile when the author is clicked', fakeAsync(() => {
    render({ user: 'pg' });

    fixture.ngZone.run(() => (el.querySelector('.subtext-laptop a[href="/user/pg"]') as HTMLElement).click());
    tick();

    expect(TestBed.inject(Location).path()).toBe('/user/pg');
  }));
});
