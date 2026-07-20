import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let apiSpy: jasmine.SpyObj<HackerNewsAPIService>;

  function createComponent(data: any, params: any, feedResult: any): FeedComponent {
    apiSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    apiSpy.fetchFeed.and.returnValue(feedResult);

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiSpy },
        { provide: ActivatedRoute, useValue: { data: of(data), params: of(params) } }
      ]
    });
    TestBed.overrideTemplate(FeedComponent, '');

    const fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges(); // triggers ngOnInit
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const component = createComponent({ feedType: 'news' }, {}, of([]));
    expect(component).toBeTruthy();
  });

  it('should set feedType from route data', () => {
    const component = createComponent({ feedType: 'show' }, {}, of([]));
    expect(component.feedType).toBe('show');
    expect(apiSpy.fetchFeed).toHaveBeenCalledWith('show', 1);
  });

  it('should default pageNum to 1 when the page param is absent', () => {
    const component = createComponent({ feedType: 'news' }, {}, of([]));
    expect(component.pageNum).toBe(1);
  });

  it('should read pageNum from the page param when present', () => {
    const component = createComponent({ feedType: 'news' }, { page: '3' }, of([]));
    expect(component.pageNum).toBe(3);
    expect(apiSpy.fetchFeed).toHaveBeenCalledWith('news', 3);
  });

  it('should populate items on success', () => {
    const items = [{ id: 1 }, { id: 2 }] as Story[];
    const component = createComponent({ feedType: 'news' }, {}, of(items));
    expect(component.items).toEqual(items);
    expect(component.errorMessage).toBe('');
  });

  it('should set errorMessage on error', () => {
    const component = createComponent(
      { feedType: 'ask' },
      {},
      throwError('boom')
    );
    expect(component.errorMessage).toBe('Could not load ask stories.');
  });

  it('should compute listStart as ((pageNum - 1) * 30) + 1', () => {
    const page1 = createComponent({ feedType: 'news' }, {}, of([]));
    expect(page1.listStart).toBe(1);

    TestBed.resetTestingModule();

    const page3 = createComponent({ feedType: 'news' }, { page: '3' }, of([]));
    expect(page3.listStart).toBe(61);
  });
});
