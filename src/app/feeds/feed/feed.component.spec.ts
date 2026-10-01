import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';
import { createHackerNewsAPIServiceSpy, createSettingsServiceSpy, createStory } from '../../../testing/mocks';

function createStories(count: number): Story[] {
  return Array.from({ length: count }, (_, i) => createStory({ id: i + 1, title: `Story ${i + 1}` }));
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let data$: BehaviorSubject<Data>;
  let params$: BehaviorSubject<Params>;
  let el: HTMLElement;

  beforeEach(() => {
    api = createHackerNewsAPIServiceSpy();
    data$ = new BehaviorSubject<Data>({ feedType: 'news' });
    params$ = new BehaviorSubject<Params>({ page: '1' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent, ItemComponent, CommentPipe, LoaderComponent, ErrorMessageComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: createSettingsServiceSpy() },
        { provide: ActivatedRoute, useValue: { data: data$, params: params$ } },
      ],
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('shows the loader while the feed is loading', () => {
    api.fetchFeed.and.returnValue(NEVER);
    fixture.detectChanges();

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('li.post')).toBeNull();
  });

  it('calls fetchFeed with the route feed type and page', () => {
    api.fetchFeed.and.returnValue(of([]));
    params$.next({ page: '2' });
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
  });

  it('defaults to page 1 when no page param is present', () => {
    api.fetchFeed.and.returnValue(of([]));
    params$.next({});
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('renders one item per story', () => {
    api.fetchFeed.and.returnValue(of(createStories(3)));
    fixture.detectChanges();

    const items = el.querySelectorAll('li.post item');
    expect(items.length).toBe(3);
    expect(items[0].querySelector('.title').textContent.trim()).toBe('Story 1');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('numbers the list from the page offset', () => {
    api.fetchFeed.and.returnValue(of(createStories(30)));
    params$.next({ page: '3' });
    fixture.detectChanges();

    expect(component.listStart).toBe(61);
    expect(el.querySelector('ol').getAttribute('start')).toBe('61');
  });

  it('shows "More" only when a full page is returned and "Prev" only after page 1', () => {
    api.fetchFeed.and.returnValue(of(createStories(30)));
    fixture.detectChanges();

    expect(el.querySelector('a.more').getAttribute('href')).toBe('/news/2');
    expect(el.querySelector('a.prev')).toBeNull();

    api.fetchFeed.and.returnValue(of(createStories(5)));
    params$.next({ page: '2' });
    fixture.detectChanges();

    expect(el.querySelector('a.more')).toBeNull();
    expect(el.querySelector('a.prev').getAttribute('href')).toBe('/news/1');
  });

  it('shows the jobs header for the jobs feed', () => {
    data$.next({ feedType: 'jobs' });
    api.fetchFeed.and.returnValue(of(createStories(1)));
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('jobs', 1);
    expect(el.querySelector('.job-header')).not.toBeNull();
  });

  it('shows an error message when the feed fails to load', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load news stories.');
    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load news stories.');
    expect(el.querySelector('app-loader')).toBeNull();
  });
});
