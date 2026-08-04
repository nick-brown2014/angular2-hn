import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let apiService: { fetchItemContent: jasmine.Spy };
  let location: { back: jasmine.Spy };
  let params: Subject<any>;
  let settings: Settings;

  const story = {
    id: 123,
    title: 'A story',
    url: 'https://example.com/a-story',
    type: 'story',
    comments: [],
    comments_count: 0
  } as Story;

  beforeEach(() => {
    params = new Subject<any>();
    apiService = { fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(story)) };
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
      imports: [PipesModule],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('creates the component and exposes the shared settings', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('loads the routed item', () => {
    component.ngOnInit();
    params.next({ id: '123' });

    expect(apiService.fetchItemContent).toHaveBeenCalledWith(123);
    expect(component.item).toBe(story);
    expect(component.errorMessage).toBe('');
  });

  it('scrolls to the top on init', () => {
    const scrollTo = spyOn(window, 'scrollTo');

    component.ngOnInit();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets an error message when the item cannot be loaded', () => {
    apiService.fetchItemContent.and.returnValue(throwError('boom'));

    component.ngOnInit();
    params.next({ id: '123' });

    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goes back through the location service', () => {
    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });

  it('treats an absolute link as an external url', () => {
    component.item = { url: 'https://example.com' } as Story;

    expect(component.hasUrl).toBe(true);
  });

  it('treats an internal item path as having no url', () => {
    component.item = { url: 'item?id=123' } as Story;

    expect(component.hasUrl).toBe(false);
  });

  it('renders the loaded item title', () => {
    component.ngOnInit();
    params.next({ id: '123' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('A story');
  });
});
