import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let routeParams: Subject<any>;
  let settings: Settings;

  const story = {
    id: 42,
    title: 'Story',
    points: 1,
    user: 'pg',
    type: 'story',
    url: 'https://example.com',
    comments_count: 0,
    comments: [],
  } as Story;

  beforeEach(async(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    routeParams = new Subject<any>();
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: routeParams.asObservable() } },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('loads the item for the route id and scrolls to top', () => {
    apiService.fetchItemContent.and.returnValue(of({ ...story }));
    fixture.detectChanges();
    routeParams.next({ id: '42' });

    expect(apiService.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item).toEqual(story);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets errorMessage when the item cannot be loaded', () => {
    apiService.fetchItemContent.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();
    routeParams.next({ id: '42' });

    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goBack() navigates back', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalledTimes(1);
  });

  it('hasUrl reflects whether the item has an external url', () => {
    component.item = { ...story };
    expect(component.hasUrl).toBe(true);
    component.item.url = 'item?id=42';
    expect(component.hasUrl).toBe(false);
  });
});
