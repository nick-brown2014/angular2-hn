import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let apiServiceStub: any;
  let activatedRouteStub: any;
  let dataSubject: BehaviorSubject<any>;
  let paramsSubject: BehaviorSubject<any>;

  const mockStory: any = {
    id: 1,
    title: 'Mock Story',
    url: 'https://example.com',
    user: 'tester',
    points: 10,
    comments_count: 0
  };

  beforeEach(() => {
    dataSubject = new BehaviorSubject<any>({ feedType: 'news' });
    paramsSubject = new BehaviorSubject<any>({ page: '1' });

    apiServiceStub = {
      fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of([mockStory]))
    };

    activatedRouteStub = {
      data: dataSubject.asObservable(),
      params: paramsSubject.asObservable()
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit sets feedType from route data', () => {
    fixture.detectChanges();
    expect(component.feedType).toBe('news');
  });

  it('ngOnInit sets pageNum from route params', () => {
    fixture.detectChanges();
    expect(component.pageNum).toBe(1);
  });

  it('ngOnInit defaults pageNum to 1 when no page param is provided', () => {
    paramsSubject.next({});
    fixture.detectChanges();
    expect(component.pageNum).toBe(1);
  });

  it('ngOnInit calls fetchFeed with the correct feedType and page', () => {
    fixture.detectChanges();
    expect(apiServiceStub.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('populates items on successful fetch', () => {
    fixture.detectChanges();
    expect(component.items).toEqual([mockStory]);
  });

  it('calculates listStart as ((pageNum - 1) * 30) + 1', () => {
    paramsSubject.next({ page: '3' });
    fixture.detectChanges();
    expect(component.listStart).toBe(61);
  });

  it('sets an errorMessage when fetchFeed fails', () => {
    apiServiceStub.fetchFeed.and.returnValue(throwError(() => new Error('boom')));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load news stories.');
  });
});
