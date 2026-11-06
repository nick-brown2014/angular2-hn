import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import {
  ActivatedRouteStub,
  createHackerNewsApiSpy,
  createSettingsServiceSpy,
  makeStories,
} from '../../../testing/mocks';

@Component({ template: '' })
class BlankComponent {}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let route: ActivatedRouteStub;

  function setup(feedType: string, params: { page?: string }) {
    route = new ActivatedRouteStub(params, { feedType });
    TestBed.overrideProvider(ActivatedRoute, { useValue: route });
    fixture = TestBed.createComponent(FeedComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  function navLink(cls: string): HTMLAnchorElement {
    return el.querySelector(`.nav a.${cls}`);
  }

  beforeEach(() => {
    api = createHackerNewsApiSpy();
    spyOn(window, 'scrollTo');
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', component: BlankComponent }]),
        SharedComponentsModule,
        PipesModule,
      ],
      declarations: [FeedComponent, ItemComponent, BlankComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: createSettingsServiceSpy() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
    });
  });

  it('shows the loader while the feed is loading', () => {
    api.fetchFeed.and.returnValue(NEVER);
    setup('news', { page: '1' });

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('app-error-message')).toBeNull();
    expect(el.querySelector('ol')).toBeNull();
  });

  it('requests the feed type from route data and the page from route params', () => {
    api.fetchFeed.and.returnValue(NEVER);
    setup('show', { page: '4' });

    expect(api.fetchFeed).toHaveBeenCalledWith('show', 4);
    expect(fixture.componentInstance.feedType).toBe('show');
    expect(fixture.componentInstance.pageNum).toBe(4);
  });

  it('defaults to page 1 when there is no page param', () => {
    api.fetchFeed.and.returnValue(NEVER);
    setup('news', {});

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('renders one item per story, numbered from the start of the page', () => {
    api.fetchFeed.and.returnValue(of(makeStories(30)));
    setup('news', { page: '2' });

    const list: HTMLOListElement = el.querySelector('ol');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(list.querySelectorAll('li.post item').length).toBe(30);
    expect(list.getAttribute('start')).toBe('31');
    expect(list.classList).toContain('list-margin');
    expect(list.querySelector('li.post a.title').textContent.trim()).toBe('Story 1');
  });

  it('scrolls to the top once the feed has loaded', () => {
    api.fetchFeed.and.returnValue(of(makeStories(3)));
    setup('news', { page: '1' });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows "More" but not "Prev" on a full first page', () => {
    api.fetchFeed.and.returnValue(of(makeStories(30)));
    setup('newest', { page: '1' });

    expect(navLink('prev')).toBeNull();
    expect(navLink('more').getAttribute('href')).toBe('/newest/2');
  });

  it('shows "Prev" and hides "More" on a partial later page', () => {
    api.fetchFeed.and.returnValue(of(makeStories(12)));
    setup('ask', { page: '3' });

    expect(navLink('prev').getAttribute('href')).toBe('/ask/2');
    expect(navLink('more')).toBeNull();
  });

  it('shows the YC jobs header and drops the list margin for the jobs feed', () => {
    api.fetchFeed.and.returnValue(of(makeStories(5, { type: 'job' })));
    setup('jobs', { page: '1' });

    expect(el.querySelector('.job-header').textContent).toContain('funded by Y Combinator');
    expect(el.querySelector('ol').classList).not.toContain('list-margin');
  });

  it('does not show the jobs header for other feeds', () => {
    api.fetchFeed.and.returnValue(of(makeStories(5)));
    setup('news', { page: '1' });

    expect(el.querySelector('.job-header')).toBeNull();
  });

  it('shows an error naming the feed when loading fails', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    setup('show', { page: '1' });

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load show stories.');
    expect(el.querySelector('ol')).toBeNull();
  });

  it('refetches when the page param changes', () => {
    api.fetchFeed.and.returnValue(of(makeStories(30)));
    setup('news', { page: '1' });

    route.params.next({ page: '2' });
    fixture.detectChanges();

    expect(api.fetchFeed.calls.mostRecent().args).toEqual(['news', 2]);
    expect(el.querySelector('ol').getAttribute('start')).toBe('31');
  });
});
