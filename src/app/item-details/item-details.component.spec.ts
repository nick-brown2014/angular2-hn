import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let apiService: { fetchItemContent: jasmine.Spy };
  let location: { back: jasmine.Spy };

  const story = {
    id: 7,
    title: 'An item',
    url: 'https://example.com/item',
    user: 'pg',
    points: 5,
    comments_count: 1,
    comments: [],
    type: 'link'
  } as unknown as Story;

  const settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  function createComponent() {
    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: of({ id: '7' }) } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    apiService = { fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(story)) };
    location = { back: jasmine.createSpy('back') };
    spyOn(window, 'scrollTo');
  });

  it('should create and load the routed item', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(apiService.fetchItemContent).toHaveBeenCalledWith(7);
    expect(component.item).toBe(story);
    expect(component.settings).toBe(settings as any);
  });

  it('should set an error message when the item cannot be loaded', () => {
    apiService.fetchItemContent.and.returnValue(throwError(new Error('offline')));

    createComponent();

    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goBack should navigate back through history', () => {
    createComponent();

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
