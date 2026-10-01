import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';
import { mockSettings, mockStories } from '../../testing/mock-data';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: BehaviorSubject<{ feedType: string }>;
  let routeParams: BehaviorSubject<{ page: string }>;

  function render(feedType: string, page = '1') {
    routeData = new BehaviorSubject({ feedType });
    routeParams = new BehaviorSubject({ page });
    TestBed.overrideProvider(ActivatedRoute, { useValue: { data: routeData, params: routeParams } });
    fixture = TestBed.createComponent(FeedComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  const items = () => element.querySelectorAll('ol li.post item');

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    api.fetchFeed.and.returnValue(of(mockStories(30)));
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule],
      declarations: [FeedComponent, ItemComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: { settings: mockSettings() } },
        { provide: ActivatedRoute, useValue: {} }
      ]
    });
  });

  ['news', 'newest', 'show', 'ask', 'jobs'].forEach(feedType => {
    it(`fetches and renders the ${feedType} feed from route data`, () => {
      const stories = mockStories(5);
      api.fetchFeed.and.returnValue(of(stories));

      render(feedType);

      expect(fixture.componentInstance.feedType).toBe(feedType);
      expect(api.fetchFeed).toHaveBeenCalledWith(feedType, 1);
      expect(items().length).toBe(5);
      expect(Array.from(element.querySelectorAll('a.title')).map(a => a.textContent.trim())).toEqual(
        stories.map(s => s.title)
      );
    });
  });

  it('shows the loader while the feed is loading', () => {
    api.fetchFeed.and.returnValue(new Subject<Story[]>());

    render('news');

    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('app-error-message')).toBeNull();
    expect(element.querySelector('ol')).toBeNull();
  });

  it('shows an error message when the feed fails to load', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));

    render('show');

    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('app-error-message .strong').textContent).toBe('Could not load show stories.');
  });

  it('shows the YC jobs header only on the jobs feed', () => {
    render('jobs');
    expect(element.querySelector('.job-header')).not.toBeNull();
    expect(element.querySelector('ol').classList).not.toContain('list-margin');
  });

  it('does not show the jobs header on other feeds', () => {
    render('news');
    expect(element.querySelector('.job-header')).toBeNull();
    expect(element.querySelector('ol').classList).toContain('list-margin');
  });

  it('numbers the list starting at 1 on the first page and scrolls to top', () => {
    render('news', '1');

    expect(fixture.componentInstance.listStart).toBe(1);
    expect(element.querySelector('ol').getAttribute('start')).toBe('1');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('offsets the list numbering by 30 per page', () => {
    render('newest', '3');

    expect(api.fetchFeed).toHaveBeenCalledWith('newest', 3);
    expect(element.querySelector('ol').getAttribute('start')).toBe('61');
  });

  it('hides the Prev link on the first page and shows More when the page is full', () => {
    render('news', '1');

    expect(element.querySelector('a.prev')).toBeNull();
    expect(element.querySelector('a.more').getAttribute('href')).toBe('/news/2');
  });

  it('shows the Prev link after the first page', () => {
    render('ask', '2');
    expect(element.querySelector('a.prev').getAttribute('href')).toBe('/ask/1');
  });

  it('hides the More link when fewer than 30 stories are returned', () => {
    api.fetchFeed.and.returnValue(of(mockStories(12)));
    render('news');
    expect(element.querySelector('a.more')).toBeNull();
  });

  it('refetches when the page param changes', () => {
    render('news', '1');
    api.fetchFeed.calls.reset();

    routeParams.next({ page: '2' });
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(element.querySelector('ol').getAttribute('start')).toBe('31');
  });
});
