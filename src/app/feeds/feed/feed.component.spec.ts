import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

function makeStories(count: number): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    points: 10,
    user: 'pg',
    time_ago: '1 hour ago',
    type: 'link',
    url: `https://example.com/${i + 1}`,
    domain: 'example.com',
    comments_count: i,
  } as any));
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let data$: BehaviorSubject<any>;
  let params$: BehaviorSubject<any>;

  beforeEach(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    data$ = new BehaviorSubject({ feedType: 'news' });
    params$ = new BehaviorSubject({ page: '1' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [FeedComponent, ItemComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data: data$, params: params$ } },
        {
          provide: SettingsService,
          useValue: { settings: { openLinkInNewTab: false, titleFontSize: '16', listSpacing: '0' } },
        },
      ],
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('fetches the feed type from route data and page from route params', () => {
    const stories = makeStories(3);
    api.fetchFeed.and.returnValue(of(stories));
    params$.next({ page: '2' });

    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
    expect(component.items).toEqual(stories);
    expect(component.listStart).toBe(31);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('defaults to page 1 when no page param is present', () => {
    api.fetchFeed.and.returnValue(of(makeStories(1)));
    params$.next({});

    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.listStart).toBe(1);
  });

  it('renders one item per story, numbered from listStart', () => {
    api.fetchFeed.and.returnValue(of(makeStories(3)));
    params$.next({ page: '3' });

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const posts = el.querySelectorAll('li.post item');
    expect(posts.length).toBe(3);
    expect(posts[0].textContent).toContain('Story 1');
    expect(el.querySelector('ol').getAttribute('start')).toBe('61');
    expect(el.querySelector('app-loader')).toBeNull();
  });

  it('shows Prev on later pages and More only when the page is full', () => {
    api.fetchFeed.and.returnValue(of(makeStories(30)));
    params$.next({ page: '2' });
    fixture.detectChanges();

    let el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.nav .prev').getAttribute('href')).toBe('/news/1');
    expect(el.querySelector('.nav .more').getAttribute('href')).toBe('/news/3');

    api.fetchFeed.and.returnValue(of(makeStories(5)));
    params$.next({ page: '1' });
    fixture.detectChanges();

    el = fixture.nativeElement;
    expect(el.querySelector('.nav .prev')).toBeNull();
    expect(el.querySelector('.nav .more')).toBeNull();
  });

  it('refetches when the page param changes', () => {
    api.fetchFeed.and.returnValue(of(makeStories(30)));
    fixture.detectChanges();

    params$.next({ page: '4' });

    expect(api.fetchFeed.calls.allArgs()).toEqual([['news', 1], ['news', 4]]);
    expect(component.listStart).toBe(91);
  });

  it('shows the loader while the feed is loading', () => {
    api.fetchFeed.and.returnValue(NEVER);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-loader')).not.toBeNull();
  });

  it('sets and renders an error message when the feed fails to load', () => {
    data$.next({ feedType: 'ask' });
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load ask stories.');
    expect(component.items).toBeUndefined();
    const error = fixture.nativeElement.querySelector('app-error-message');
    expect(error.textContent).toContain('Could not load ask stories.');
  });

  it('shows the jobs header only for the jobs feed', () => {
    data$.next({ feedType: 'jobs' });
    api.fetchFeed.and.returnValue(of(makeStories(1)));

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.job-header')).not.toBeNull();
  });
});
