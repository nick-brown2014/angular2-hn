import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';
import { createMockSettingsService } from '../../testing/mock-settings.service';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let params$: Subject<any>;
  let api: { fetchItemContent: jasmine.Spy };
  let location: { back: jasmine.Spy };
  let settingsService: ReturnType<typeof createMockSettingsService>;

  const story = {
    id: 99,
    title: 'Detailed story',
    points: 10,
    user: 'carol',
    time_ago: '3 hours ago',
    type: 'link',
    url: 'https://example.org/x',
    domain: 'example.org',
    comments: [{ id: 1, user: 'd', time_ago: '', content: '', deleted: false, comments: [] }],
    comments_count: 1
  } as any as Story;

  beforeEach(async () => {
    params$ = new Subject<any>();
    api = { fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(story)) };
    location = { back: jasmine.createSpy('back') };
    settingsService = createMockSettingsService();
    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: settingsService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsService.settings);
  });

  it('scrolls to the top on init', () => {
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows the loader until the item arrives', () => {
    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
  });

  it('fetches the item from the route id', () => {
    params$.next({ id: '99' });
    fixture.detectChanges();

    expect(api.fetchItemContent).toHaveBeenCalledWith(99);
    expect(component.item).toEqual(story);
    expect(component.errorMessage).toBe('');
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-comment').length).toBe(1);
  });

  it('sets an error message when the fetch fails', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('nope')));
    params$.next({ id: '5' });
    fixture.detectChanges();

    expect(component.item).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load item comments.');
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeTruthy();
  });

  it('goBack delegates to Location.back', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('hasUrl reflects whether the item links externally', () => {
    component.item = { ...story };
    expect(component.hasUrl).toBe(true);

    component.item = { ...story, url: 'item?id=99' };
    expect(component.hasUrl).toBe(false);
  });

  it('renders poll results for polls', () => {
    api.fetchItemContent.and.returnValue(of({
      ...story,
      type: 'poll',
      url: 'item?id=99',
      poll: [{ points: 1, content: 'A' }, { points: 3, content: 'B' }],
      poll_votes_count: 4
    }));
    params$.next({ id: '99' });
    fixture.detectChanges();

    const bars = fixture.nativeElement.querySelectorAll('.pollBar');
    expect(bars.length).toBe(2);
    expect(bars[1].style.width).toBe('75%');
  });
});
