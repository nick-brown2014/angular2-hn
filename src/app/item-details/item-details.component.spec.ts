import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let apiService: { fetchItemContent: jasmine.Spy };
  let location: { back: jasmine.Spy };
  const story = { id: 42, title: 'An item', url: 'https://example.com' } as Story;

  const createComponent = () => {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(() => {
    apiService = { fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(story)) };
    location = { back: jasmine.createSpy('back') };

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings: { theme: 'default' } } },
        { provide: ActivatedRoute, useValue: { params: of({ id: '42' }), data: of({}) } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load the item on init', () => {
    createComponent();
    component.ngOnInit();

    expect(apiService.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item).toEqual(story);
    expect(component.errorMessage).toBe('');
  });

  it('should set an error message when the item fails to load', () => {
    apiService.fetchItemContent.and.returnValue(throwError('boom'));
    createComponent();
    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('should navigate back', () => {
    createComponent();
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('should detect external urls', () => {
    createComponent();
    component.ngOnInit();
    expect(component.hasUrl).toBe(true);

    component.item = { url: 'item?id=42' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
