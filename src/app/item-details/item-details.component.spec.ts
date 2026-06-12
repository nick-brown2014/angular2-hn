import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let mockHnService: any;
  let mockLocation: any;
  let mockSettingsService: any;

  const mockStory: Story = {
    id: 123, title: 'Test Story', points: 50, user: 'testuser', time: 123,
    time_ago: 1, type: 'link' as any, url: 'http://example.com', domain: 'example.com',
    comments: [], comments_count: 3, poll: [], poll_votes_count: 0,
    deleted: false, dead: false
  };

  beforeEach(async(() => {
    mockHnService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    mockHnService.fetchItemContent.and.returnValue(of(mockStory));

    mockLocation = jasmine.createSpyObj('Location', ['back']);

    mockSettingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    TestBed.configureTestingModule({
      imports: [PipesModule, RouterTestingModule],
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHnService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ActivatedRoute, useValue: { params: of({ id: '123' }) } },
        { provide: Location, useValue: mockLocation }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(window, 'scrollTo');
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchItemContent with the route param ID as a number', () => {
    expect(mockHnService.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('should populate item on success', () => {
    expect(component.item).toEqual(mockStory);
  });

  it('should set errorMessage on fetch error', () => {
    mockHnService.fetchItemContent.and.returnValue(throwError('error'));
    component.ngOnInit();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goBack() should call _location.back()', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('hasUrl should return true when item.url starts with http', () => {
    component.item = { ...mockStory, url: 'http://example.com' };
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return false when item.url does not start with http', () => {
    component.item = { ...mockStory, url: 'item?id=123' };
    expect(component.hasUrl).toBe(false);
  });
});
