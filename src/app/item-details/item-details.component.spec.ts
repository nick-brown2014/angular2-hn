import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  const settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };
  const story = {
    id: 88,
    title: 'An item with comments',
    url: 'https://example.com/item',
    type: 'story',
    comments_count: 2,
    comments: []
  } as Story;

  beforeEach(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: of({ id: '88' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('is created with the settings from the settings service', () => {
    apiService.fetchItemContent.and.returnValue(of(story));

    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings as any);
  });

  it('loads the item for the route id', () => {
    apiService.fetchItemContent.and.returnValue(of(story));

    fixture.detectChanges();

    expect(apiService.fetchItemContent).toHaveBeenCalledWith(88);
    expect(component.item).toBe(story);
    expect(component.errorMessage).toBe('');
  });

  it('sets an error message when the item cannot be loaded', () => {
    apiService.fetchItemContent.and.returnValue(throwError('offline'));

    fixture.detectChanges();

    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('exposes whether the item links out', () => {
    apiService.fetchItemContent.and.returnValue(of(story));

    fixture.detectChanges();

    expect(component.hasUrl).toBe(true);

    component.item.url = 'item?id=88';
    expect(component.hasUrl).toBe(false);
  });

  it('goBack navigates back through Location', () => {
    apiService.fetchItemContent.and.returnValue(of(story));

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });

  it('renders the item title once loaded', () => {
    apiService.fetchItemContent.and.returnValue(of(story));

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.title').textContent).toContain('An item with comments');
  });
});
