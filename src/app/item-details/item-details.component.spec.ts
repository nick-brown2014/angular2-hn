import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let routeParams: Subject<any>;
  let settings: Settings;
  let scrollSpy: jasmine.Spy;

  const story = (overrides: Partial<Story> = {}): Story => ({
    id: 10,
    title: 'Detailed story',
    points: 12,
    user: 'dang',
    time_ago: '1 hour ago',
    type: 'link',
    url: 'https://example.com/a',
    domain: 'example.com',
    comments_count: 2,
    comments: [{ id: 11 }, { id: 12 }],
    ...overrides
  } as Story);

  beforeEach(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    routeParams = new Subject<any>();
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    scrollSpy = spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: routeParams.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('scrolls to the top on init', () => {
    fixture.detectChanges();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('shows the loader before the item loads', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.item')).toBeNull();
  });

  it('fetches the item for the numeric route id', () => {
    const item = story();
    apiService.fetchItemContent.and.returnValue(of(item));
    fixture.detectChanges();

    routeParams.next({ id: '10' });

    expect(apiService.fetchItemContent).toHaveBeenCalledWith(10);
    expect(component.item).toBe(item);
    expect(component.errorMessage).toBe('');
  });

  it('renders the item title, meta and one app-comment per comment', () => {
    apiService.fetchItemContent.and.returnValue(of(story()));
    fixture.detectChanges();
    routeParams.next({ id: '10' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.laptop a.title').getAttribute('href')).toBe('https://example.com/a');
    expect(el.querySelector('.laptop .domain').textContent).toBe('(example.com)');
    expect(el.querySelector('.subtext').textContent).toContain('12 points by');
    expect(el.querySelector('.subtext').textContent).toContain('2 comments');
    expect(el.querySelectorAll('app-comment').length).toBe(2);
    expect(el.querySelector('.pollResults')).toBeNull();
  });

  it('renders poll results with proportional bar widths for polls', () => {
    apiService.fetchItemContent.and.returnValue(of(story({
      type: 'poll',
      url: 'item?id=10',
      poll: [{ points: 3, content: 'A' }, { points: 1, content: 'B' }],
      poll_votes_count: 4
    })));
    fixture.detectChanges();
    routeParams.next({ id: '10' });
    fixture.detectChanges();

    const bars: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.pollBar');
    expect(bars.length).toBe(2);
    expect(bars[0].style.width).toBe('75%');
    expect(bars[1].style.width).toBe('25%');
  });

  it('sets errorMessage and shows the error component when the fetch fails', () => {
    apiService.fetchItemContent.and.returnValue(throwError(new Error('nope')));
    fixture.detectChanges();
    routeParams.next({ id: '10' });
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load item comments.');
    expect(component.item).toBeUndefined();
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });

  describe('hasUrl', () => {
    it('reflects whether the item url is external', () => {
      component.item = story({ url: 'https://example.com' });
      expect(component.hasUrl).toBe(true);
      component.item = story({ url: 'item?id=10' });
      expect(component.hasUrl).toBe(false);
    });
  });

  it('goBack navigates back via Location', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
