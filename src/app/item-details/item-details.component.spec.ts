import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  const story = { id: 42, title: 'Story', url: 'https://example.com', comments: [] } as Story;
  const settingsStub = {
    settings: { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' },
  };

  beforeEach(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    apiService.fetchItemContent.and.returnValue(of(story));
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: settingsStub },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: of({ id: '42' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsStub.settings);
  });

  it('fetches the item by numeric id and sets it on success', () => {
    fixture.detectChanges();
    expect(apiService.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item).toEqual(story);
    expect(component.errorMessage).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets errorMessage on error', () => {
    apiService.fetchItemContent.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();
    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goBack() calls Location.back', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('hasUrl returns true when item.url starts with http', () => {
    component.item = { ...story, url: 'http://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
    component.item = { ...story, url: 'https://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl returns false for internal item urls', () => {
    component.item = { ...story, url: 'item?id=42' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
