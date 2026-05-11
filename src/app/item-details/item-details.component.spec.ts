import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { PipesModule } from '../shared/pipes/pipes.module';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let apiServiceStub: any;
  let settingsServiceStub: any;
  let locationStub: any;
  let paramsSubject: BehaviorSubject<any>;

  const mockItem: any = {
    id: 123,
    title: 'Mock Item',
    url: 'https://example.com/item',
    user: 'tester',
    points: 5,
    type: 'story',
    comments: [],
    comments_count: 0
  };

  beforeEach(() => {
    paramsSubject = new BehaviorSubject<any>({ id: '123' });

    apiServiceStub = {
      fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(mockItem))
    };

    settingsServiceStub = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    locationStub = {
      back: jasmine.createSpy('back')
    };

    TestBed.configureTestingModule({
      imports: [PipesModule],
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiServiceStub },
        { provide: SettingsService, useValue: settingsServiceStub },
        { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
        { provide: Location, useValue: locationStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the settings from the SettingsService', () => {
    expect(component.settings).toBe(settingsServiceStub.settings);
  });

  it('ngOnInit subscribes to route params and calls fetchItemContent with the numeric id', () => {
    fixture.detectChanges();
    expect(apiServiceStub.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('sets item on successful fetch', () => {
    fixture.detectChanges();
    expect(component.item).toEqual(mockItem);
  });

  it('sets an errorMessage when fetchItemContent fails', () => {
    apiServiceStub.fetchItemContent.and.returnValue(throwError(() => new Error('boom')));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goBack() delegates to Location.back()', () => {
    component.goBack();
    expect(locationStub.back).toHaveBeenCalled();
  });

  it('hasUrl returns true when item.url starts with "http"', () => {
    fixture.detectChanges();
    component.item = { ...mockItem, url: 'https://example.com' } as any;
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl returns false when item.url does not start with "http"', () => {
    fixture.detectChanges();
    component.item = { ...mockItem, url: 'item?id=42' } as any;
    expect(component.hasUrl).toBe(false);
  });
});
