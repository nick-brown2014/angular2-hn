import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let params$: Subject<any>;
  const stories = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }] as Story[];

  function setup(data: any, params: any) {
    params$ = new Subject<any>();
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    apiService.fetchFeed.and.returnValue(of(stories));

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { data: of(data), params: params$.asObservable() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
    fixture.detectChanges();
    params$.next(params);
  }

  it('should create', () => {
    setup({ feedType: 'news' }, { page: '1' });
    expect(component).toBeTruthy();
  });

  it('sets feedType from route data and pageNum from route params', () => {
    setup({ feedType: 'ask' }, { page: '3' });
    expect(component.feedType).toBe('ask');
    expect(component.pageNum).toBe(3);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('ask', 3);
  });

  it('defaults pageNum to 1 when page param is missing', () => {
    setup({ feedType: 'news' }, {});
    expect(component.pageNum).toBe(1);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('populates items on success and scrolls to top', () => {
    setup({ feedType: 'news' }, { page: '1' });
    expect(component.items).toEqual(stories);
    expect(component.errorMessage).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('computes listStart as ((pageNum - 1) * 30) + 1', () => {
    setup({ feedType: 'news' }, { page: '1' });
    expect(component.listStart).toBe(1);
    params$.next({ page: '2' });
    expect(component.listStart).toBe(31);
    params$.next({ page: '4' });
    expect(component.listStart).toBe(91);
  });

  it('sets errorMessage when the feed fails to load', () => {
    setup({ feedType: 'show' }, { page: '1' });
    apiService.fetchFeed.and.returnValue(throwError(new Error('boom')));
    params$.next({ page: '2' });
    expect(component.errorMessage).toBe('Could not load show stories.');
  });
});
