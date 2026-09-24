import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let data$: Subject<any>;
  let params$: Subject<any>;
  let api: { fetchFeed: jasmine.Spy };
  let scrollSpy: jasmine.Spy;

  const stories = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }] as Story[];

  beforeEach(async () => {
    data$ = new Subject<any>();
    params$ = new Subject<any>();
    api = { fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(stories)) };
    scrollSpy = spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data: data$.asObservable(), params: params$.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('shows the loader before items arrive', () => {
    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeNull();
  });

  it('reads the feed type from route data', () => {
    data$.next({ feedType: 'ask' });
    expect(component.feedType).toBe('ask');
  });

  it('fetches the requested page and computes listStart', () => {
    data$.next({ feedType: 'news' });
    params$.next({ page: '3' });

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 3);
    expect(component.pageNum).toBe(3);
    expect(component.items).toEqual(stories);
    expect(component.listStart).toBe(61);
    expect(component.errorMessage).toBe('');
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('defaults to page 1 when no page param is present', () => {
    data$.next({ feedType: 'show' });
    params$.next({});

    expect(api.fetchFeed).toHaveBeenCalledWith('show', 1);
    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('renders one <item> per story', () => {
    data$.next({ feedType: 'news' });
    params$.next({ page: '1' });
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('item');
    expect(items.length).toBe(2);
    expect(fixture.nativeElement.querySelector('ol').getAttribute('start')).toBe('1');
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });

  it('sets an error message when fetching fails', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('boom')));
    data$.next({ feedType: 'jobs' });
    params$.next({ page: '1' });
    fixture.detectChanges();

    expect(component.items).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load jobs stories.');
    expect(component.listStart).toBeUndefined();
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeTruthy();
  });

  it('refetches when the page param changes', () => {
    data$.next({ feedType: 'news' });
    params$.next({ page: '1' });
    params$.next({ page: '2' });

    expect(api.fetchFeed).toHaveBeenCalledTimes(2);
    expect(api.fetchFeed.calls.mostRecent().args).toEqual(['news', 2]);
    expect(component.listStart).toBe(31);
  });
});
