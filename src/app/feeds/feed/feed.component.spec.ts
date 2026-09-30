import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Data, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { Story } from '../../shared/models/story';
import { createHackerNewsAPIServiceSpy, createStory } from '../../shared/testing/mocks';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let data: BehaviorSubject<Data>;
  let params: BehaviorSubject<Params>;

  function createStories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => createStory({ id: i + 1, title: `Story ${i + 1}` }));
  }

  function render(feedType: string, routeParams: Params) {
    data.next({ feedType });
    params.next(routeParams);
    fixture = TestBed.createComponent(FeedComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = createHackerNewsAPIServiceSpy();
    data = new BehaviorSubject<Data>({});
    params = new BehaviorSubject<Params>({});
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data, params } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('should show the loader while stories are loading', () => {
    api.fetchFeed.and.returnValue(new Subject<Story[]>());
    render('news', { page: '1' });

    expect(element.querySelector('app-loader')).toBeTruthy();
    expect(element.querySelector('ol')).toBeNull();
  });

  it('should fetch the feed for the route feed type and page', () => {
    api.fetchFeed.and.returnValue(of(createStories(3)));
    render('show', { page: '4' });

    expect(api.fetchFeed).toHaveBeenCalledWith('show', 4);
    expect(fixture.componentInstance.feedType).toBe('show');
    expect(fixture.componentInstance.pageNum).toBe(4);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should default to the first page when no page param is present', () => {
    api.fetchFeed.and.returnValue(of([]));
    render('news', {});

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('should render a list item for each story', () => {
    const stories = createStories(3);
    api.fetchFeed.and.returnValue(of(stories));
    render('news', { page: '1' });

    const items = element.querySelectorAll('ol li.post item');
    expect(items.length).toBe(3);
    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('ol').getAttribute('start')).toBe('1');
    expect(element.querySelector('ol').classList).toContain('list-margin');
  });

  it('should number the list from the start of the current page', () => {
    api.fetchFeed.and.returnValue(of(createStories(30)));
    render('news', { page: '3' });

    expect(element.querySelector('ol').getAttribute('start')).toBe('61');
  });

  it('should only link to the next page on a full first page', () => {
    api.fetchFeed.and.returnValue(of(createStories(30)));
    render('news', { page: '1' });

    expect(element.querySelector('.nav .prev')).toBeNull();
    expect(element.querySelector('.nav .more').getAttribute('href')).toBe('/news/2');
  });

  it('should only link to the previous page on a partial later page', () => {
    api.fetchFeed.and.returnValue(of(createStories(12)));
    render('newest', { page: '2' });

    expect(element.querySelector('.nav .prev').getAttribute('href')).toBe('/newest/1');
    expect(element.querySelector('.nav .more')).toBeNull();
  });

  it('should refetch when the page param changes', () => {
    api.fetchFeed.and.returnValue(of(createStories(30)));
    render('news', { page: '1' });

    params.next({ page: '2' });
    fixture.detectChanges();

    expect(api.fetchFeed.calls.mostRecent().args).toEqual(['news', 2]);
    expect(element.querySelector('.nav .prev').getAttribute('href')).toBe('/news/1');
  });

  it('should show the jobs header without list margin for the jobs feed', () => {
    api.fetchFeed.and.returnValue(of(createStories(2)));
    render('jobs', { page: '1' });

    expect(element.querySelector('.job-header').textContent).toContain('Y Combinator');
    expect(element.querySelector('ol').classList).not.toContain('list-margin');
  });

  it('should not show the jobs header for other feeds', () => {
    api.fetchFeed.and.returnValue(of(createStories(2)));
    render('ask', { page: '1' });

    expect(element.querySelector('.job-header')).toBeNull();
  });

  it('should show an error message when the feed fails to load', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    render('ask', { page: '1' });

    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('app-error-message .strong').textContent).toBe('Could not load ask stories.');
  });
});
