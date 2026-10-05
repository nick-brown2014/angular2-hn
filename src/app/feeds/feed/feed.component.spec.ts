import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

function createStories(count: number, startId = 1): Story[] {
  return Array.from({ length: count }, (_, i) => {
    const id = startId + i;
    return {
      id,
      title: `Story ${id}`,
      points: id * 10,
      user: `user${id}`,
      time: 1600000000,
      time_ago: '1 hour ago' as any,
      type: 'story',
      url: `https://example.com/${id}`,
      domain: 'example.com',
      comments: [],
      comments_count: id,
      poll: null,
      poll_votes_count: 0,
      deleted: false,
      dead: false,
    } as Story;
  });
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: BehaviorSubject<any>;
  let routeParams: BehaviorSubject<any>;

  function render() {
    fixture = TestBed.createComponent(FeedComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    routeData = new BehaviorSubject({ feedType: 'news' });
    routeParams = new BehaviorSubject({ page: '1' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [FeedComponent, ItemComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data: routeData, params: routeParams } },
        {
          provide: SettingsService,
          useValue: {
            settings: {
              showSettings: false,
              openLinkInNewTab: false,
              theme: 'default',
              titleFontSize: '16',
              listSpacing: '0',
            },
          },
        },
      ],
    });
  });

  it('shows the loader while the feed is loading', () => {
    api.fetchFeed.and.returnValue(NEVER);
    render();

    expect(el.querySelector('app-loader')).toBeTruthy();
    expect(el.querySelector('app-error-message')).toBeNull();
    expect(el.querySelector('ol')).toBeNull();
  });

  it('fetches the feed for the route feed type and page', () => {
    api.fetchFeed.and.returnValue(of([]));
    routeData.next({ feedType: 'show' });
    routeParams.next({ page: '3' });
    render();

    expect(api.fetchFeed).toHaveBeenCalledWith('show', 3);
    expect(fixture.componentInstance.feedType).toBe('show');
    expect(fixture.componentInstance.pageNum).toBe(3);
  });

  it('defaults to page 1 when no page param is present', () => {
    api.fetchFeed.and.returnValue(of([]));
    routeParams.next({});
    render();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('renders a list item for every story', () => {
    api.fetchFeed.and.returnValue(of(createStories(3)));
    render();

    const items = el.querySelectorAll('ol li.post item');
    expect(items.length).toBe(3);
    expect(el.querySelector('app-loader')).toBeNull();

    const titles = Array.from(el.querySelectorAll('ol li.post a.title')).map(a => a.textContent.trim());
    expect(titles).toEqual(['Story 1', 'Story 2', 'Story 3']);

    const firstItem = items[0].textContent.replace(/\s+/g, ' ');
    expect(firstItem).toContain('10 points by user1');
    expect(firstItem).toContain('1 comment');
  });

  it('numbers the list based on the page and scrolls to the top', () => {
    api.fetchFeed.and.returnValue(of(createStories(30, 31)));
    routeParams.next({ page: '2' });
    render();

    expect(fixture.componentInstance.listStart).toBe(31);
    expect(el.querySelector('ol').getAttribute('start')).toBe('31');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows a "More" link when the page is full and no "Prev" link on the first page', () => {
    api.fetchFeed.and.returnValue(of(createStories(30)));
    render();

    const more = el.querySelector('.nav a.more');
    expect(more).toBeTruthy();
    expect(more.getAttribute('href')).toBe('/news/2');
    expect(el.querySelector('.nav a.prev')).toBeNull();
  });

  it('shows a "Prev" link and hides "More" on a partial later page', () => {
    api.fetchFeed.and.returnValue(of(createStories(5)));
    routeParams.next({ page: '3' });
    render();

    const prev = el.querySelector('.nav a.prev');
    expect(prev).toBeTruthy();
    expect(prev.getAttribute('href')).toBe('/news/2');
    expect(el.querySelector('.nav a.more')).toBeNull();
  });

  it('renders an empty list when the feed has no stories', () => {
    api.fetchFeed.and.returnValue(of([]));
    render();

    expect(el.querySelector('ol')).toBeTruthy();
    expect(el.querySelectorAll('ol li').length).toBe(0);
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')).toBeNull();
  });

  it('shows an error message when the feed fails to load', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('ol')).toBeNull();
    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load news stories.');
  });

  it('shows the jobs header only on the jobs feed', () => {
    api.fetchFeed.and.returnValue(of(createStories(1)));
    render();
    expect(el.querySelector('.job-header')).toBeNull();

    routeData.next({ feedType: 'jobs' });
    routeParams.next({ page: '1' });
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('jobs', 1);
    expect(el.querySelector('.job-header').textContent).toContain('Y Combinator');
  });

  it('refetches when the page param changes', () => {
    api.fetchFeed.and.returnValue(of(createStories(30)));
    render();

    routeParams.next({ page: '2' });
    fixture.detectChanges();

    expect(api.fetchFeed.calls.allArgs()).toEqual([['news', 1], ['news', 2]]);
    expect(el.querySelector('ol').getAttribute('start')).toBe('31');
  });
});
