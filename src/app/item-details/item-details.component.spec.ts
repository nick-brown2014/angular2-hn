import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';
import { PipesModule } from '../shared/pipes/pipes.module';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let apiServiceSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let paramsSubject: BehaviorSubject<{ [key: string]: string }>;

  function makeStory(overrides: Partial<Story> = {}): Story {
    return {
      id: 123,
      title: 'Detail Story',
      points: 10,
      user: 'alice',
      time: 0,
      time_ago: 0,
      type: 'story',
      url: 'https://example.com',
      domain: 'example.com',
      comments: [],
      comments_count: 0,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false,
      ...overrides
    } as Story;
  }

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    apiServiceSpy.fetchItemContent.and.returnValue(of(makeStory()));

    locationSpy = jasmine.createSpyObj<Location>('Location', ['back']);

    paramsSubject = new BehaviorSubject<{ [key: string]: string }>({ id: '123' });

    const settingsServiceStub = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      imports: [PipesModule],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiServiceSpy },
        { provide: SettingsService, useValue: settingsServiceStub },
        { provide: Location, useValue: locationSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should fetch item content using the route param id', () => {
    fixture.detectChanges();
    expect(apiServiceSpy.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('should set item on a successful API response', () => {
    const story = makeStory({ id: 123, title: 'Hello' });
    apiServiceSpy.fetchItemContent.and.returnValue(of(story));
    fixture.detectChanges();
    expect(component.item).toEqual(story);
  });

  it('should set errorMessage on an API error', () => {
    apiServiceSpy.fetchItemContent.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goBack should call Location.back()', () => {
    fixture.detectChanges();
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('hasUrl should return true for http URLs', () => {
    fixture.detectChanges();
    component.item = makeStory({ url: 'http://example.com' });
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return true for https URLs', () => {
    fixture.detectChanges();
    component.item = makeStory({ url: 'https://example.com' });
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return false for non-http URLs', () => {
    fixture.detectChanges();
    component.item = makeStory({ url: '' });
    expect(component.hasUrl).toBe(false);
  });
});
