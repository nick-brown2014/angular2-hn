import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let apiService: { fetchFeed: jasmine.Spy };
  const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }] as Story[];

  function configure(feedType: string, page: string, feed: Observable<Story[]>): void {
    apiService = { fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(feed) };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ feedType }), params: of({ page }) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates', () => {
    configure('news', '1', of(stories));

    expect(component).toBeTruthy();
    expect(component.errorMessage).toBe('');
  });

  it('ngOnInit loads the requested feed page', () => {
    configure('show', '3', of(stories));
    const scrollTo = spyOn(window, 'scrollTo');

    component.ngOnInit();

    expect(component.feedType).toBe('show');
    expect(component.pageNum).toBe(3);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('show', 3);
    expect(component.items).toEqual(stories);
    expect(component.listStart).toBe(61);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('ngOnInit defaults to the first page when no page param is present', () => {
    apiService = { fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(stories)) };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { data: of({ feedType: 'news' }), params: of({}) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    component = TestBed.createComponent(FeedComponent).componentInstance;
    spyOn(window, 'scrollTo');

    component.ngOnInit();

    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('ngOnInit sets an error message when the feed cannot be loaded', () => {
    configure('ask', '1', throwError(new Error('offline')));

    component.ngOnInit();

    expect(component.items).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load ask stories.');
  });
});
