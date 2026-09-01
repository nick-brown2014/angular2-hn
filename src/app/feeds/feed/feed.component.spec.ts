import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let apiService: { fetchFeed: jasmine.Spy };

  const stories = [{ id: 1, title: 'A story' }, { id: 2, title: 'Another story' }] as Story[];

  function createComponent(routeData: any, routeParams: any) {
    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { data: of(routeData), params: of(routeParams) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    apiService = { fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(stories)) };
    spyOn(window, 'scrollTo');
  });

  it('should create', () => {
    createComponent({ feedType: 'news' }, {});

    expect(component).toBeTruthy();
  });

  it('should load the first page of the routed feed by default', () => {
    createComponent({ feedType: 'news' }, {});

    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(1);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.items).toBe(stories);
    expect(component.listStart).toBe(1);
    expect(component.errorMessage).toBe('');
  });

  it('should load the requested page and offset the list numbering', () => {
    createComponent({ feedType: 'show' }, { page: '3' });

    expect(component.feedType).toBe('show');
    expect(component.pageNum).toBe(3);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('show', 3);
    expect(component.listStart).toBe(61);
  });

  it('should scroll back to the top once the feed has loaded', () => {
    createComponent({ feedType: 'news' }, { page: '2' });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should set an error message when the feed cannot be loaded', () => {
    apiService.fetchFeed.and.returnValue(throwError(new Error('offline')));

    createComponent({ feedType: 'jobs' }, { page: '1' });

    expect(component.items).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load jobs stories.');
    expect(component.listStart).toBeUndefined();
  });
});
