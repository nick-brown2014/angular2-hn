import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
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
  let story: Story;
  const settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  const configure = () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: of({ id: '42' }) } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    story = {
      id: 42,
      title: 'A story',
      url: 'https://example.com/story',
      type: 'news',
      user: 'pg',
      points: 10,
      comments: [],
      comments_count: 0
    } as any;
    apiService = { fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(story)) };
    location = { back: jasmine.createSpy('back') };
  });

  it('should create', () => {
    configure();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the item identified by the route param', () => {
    configure();
    fixture.detectChanges();

    expect(apiService.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item).toBe(story);
  });

  it('should set an error message when the item cannot be loaded', () => {
    apiService.fetchItemContent.and.returnValue(throwError('boom'));
    configure();
    fixture.detectChanges();

    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('should navigate back through Location', () => {
    configure();
    fixture.detectChanges();

    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  describe('hasUrl', () => {
    beforeEach(() => {
      configure();
      fixture.detectChanges();
    });

    it('should be true for an external url', () => {
      component.item.url = 'https://example.com/story';
      expect(component.hasUrl).toBe(true);
    });

    it('should be false for an internal hacker news url', () => {
      component.item.url = 'item?id=42';
      expect(component.hasUrl).toBe(false);
    });
  });
});
