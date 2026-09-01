import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  const stories = [{ id: 1, title: 'Story one' }, { id: 2, title: 'Story two' }] as Story[];

  function createComponent(page: string) {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ feedType: 'show' }), params: of({ page }) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('is created', () => {
    createComponent('1');
    apiService.fetchFeed.and.returnValue(of(stories));

    expect(component).toBeTruthy();
  });

  it('loads the feed for the route feed type and page', () => {
    createComponent('3');
    apiService.fetchFeed.and.returnValue(of(stories));

    fixture.detectChanges();

    expect(component.feedType).toBe('show');
    expect(component.pageNum).toBe(3);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('show', 3);
    expect(component.items).toEqual(stories);
    expect(component.listStart).toBe(61);
    expect(component.errorMessage).toBe('');
  });

  it('defaults to the first page when the route has no page', () => {
    createComponent(undefined);
    apiService.fetchFeed.and.returnValue(of(stories));

    fixture.detectChanges();

    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('scrolls back to the top once the feed is loaded', () => {
    createComponent('2');
    apiService.fetchFeed.and.returnValue(of(stories));
    const scrollTo = spyOn(window, 'scrollTo');

    fixture.detectChanges();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets an error message when the feed cannot be loaded', () => {
    createComponent('1');
    apiService.fetchFeed.and.returnValue(throwError('offline'));

    fixture.detectChanges();

    expect(component.items).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load show stories.');
  });
});
