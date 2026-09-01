import { CommonModule, Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let apiService: { fetchItemContent: jasmine.Spy };
  let location: { back: jasmine.Spy };
  let settings: Settings;

  const story = {
    id: 42,
    title: 'A story',
    url: 'https://example.com/a',
    type: 'story',
    comments: [],
    comments_count: 0
  } as Story;

  function configure(item: Observable<Story>): void {
    apiService = { fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(item) };
    location = { back: jasmine.createSpy('back') };
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      imports: [CommonModule, PipesModule],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: of({ id: '42' }) } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  }

  it('creates and reads the settings from the service', () => {
    configure(of(story));

    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('ngOnInit loads the item for the route id', () => {
    configure(of(story));
    const scrollTo = spyOn(window, 'scrollTo');

    component.ngOnInit();

    expect(apiService.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item).toEqual(story);
    expect(component.errorMessage).toBe('');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('ngOnInit sets an error message when the item cannot be loaded', () => {
    configure(throwError(new Error('offline')));
    spyOn(window, 'scrollTo');

    component.ngOnInit();

    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('hasUrl distinguishes external links from internal item links', () => {
    configure(of(story));

    component.item = { url: 'https://example.com/a' } as Story;
    expect(component.hasUrl).toBe(true);

    component.item = { url: 'item?id=42' } as Story;
    expect(component.hasUrl).toBe(false);
  });

  it('goBack navigates back through Location', () => {
    configure(of(story));

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
