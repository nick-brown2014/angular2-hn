import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let apiService: { fetchFeed: jasmine.Spy };
  let data: Subject<any>;
  let params: Subject<any>;

  const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }] as Story[];

  function build() {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    data = new Subject<any>();
    params = new Subject<any>();
    apiService = { fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(stories)) };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { data, params } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    build();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(component.errorMessage).toBe('');
  });

  it('loads the feed for the routed type and page', () => {
    component.ngOnInit();
    data.next({ feedType: 'show' });
    params.next({ page: '3' });

    expect(component.feedType).toBe('show');
    expect(component.pageNum).toBe(3);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('show', 3);
    expect(component.items).toBe(stories);
  });

  it('defaults to the first page when no page param is present', () => {
    component.ngOnInit();
    data.next({ feedType: 'news' });
    params.next({});

    expect(component.pageNum).toBe(1);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('computes the list start offset from the page number', () => {
    component.ngOnInit();
    data.next({ feedType: 'news' });

    params.next({ page: '1' });
    expect(component.listStart).toBe(1);

    params.next({ page: '4' });
    expect(component.listStart).toBe(91);
  });

  it('scrolls to the top once the feed has loaded', () => {
    const scrollTo = spyOn(window, 'scrollTo');

    component.ngOnInit();
    data.next({ feedType: 'news' });
    params.next({ page: '2' });

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets an error message when the feed cannot be loaded', () => {
    apiService.fetchFeed.and.returnValue(throwError('boom'));

    component.ngOnInit();
    data.next({ feedType: 'ask' });
    params.next({ page: '1' });

    expect(component.items).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load ask stories.');
  });

  it('renders one list entry per story', () => {
    component.ngOnInit();
    data.next({ feedType: 'news' });
    params.next({ page: '1' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('li.post').length).toBe(2);
  });
});
