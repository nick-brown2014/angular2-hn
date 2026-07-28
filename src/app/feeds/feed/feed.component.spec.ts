import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let apiService: { fetchFeed: jasmine.Spy };
  let stories: Story[];

  const configure = (params: any = { page: '2' }) => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ feedType: 'news' }), params: of(params) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    stories = [{ id: 1, title: 'A story' } as Story, { id: 2, title: 'Another story' } as Story];
    apiService = { fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(stories)) };
  });

  it('should create', () => {
    configure();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the feed for the route feed type and page', () => {
    configure();
    fixture.detectChanges();

    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.items).toEqual(stories);
  });

  it('should compute the list start from the page number', () => {
    configure();
    fixture.detectChanges();
    expect(component.listStart).toBe(31);
  });

  it('should default to the first page when no page param is present', () => {
    configure({});
    fixture.detectChanges();

    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('should set an error message when the feed cannot be loaded', () => {
    apiService.fetchFeed.and.returnValue(throwError('boom'));
    configure();
    fixture.detectChanges();

    expect(component.items).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load news stories.');
  });
});
