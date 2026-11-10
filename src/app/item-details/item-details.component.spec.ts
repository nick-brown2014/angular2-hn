import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 8863,
    title: 'My YC app: Dropbox',
    points: 111,
    user: 'dhouston',
    time_ago: '14 years ago',
    type: 'link',
    url: 'http://www.getdropbox.com/u/2/screencast.html',
    domain: 'getdropbox.com',
    comments_count: 2,
    content: '',
    comments: [
      { id: 1, level: 0, user: 'alice', time_ago: '1 hour ago', content: '<p>First</p>', deleted: false, comments: [] },
      { id: 2, level: 0, user: 'bob', time_ago: '2 hours ago', content: '<p>Second</p>', deleted: false, comments: [] },
    ],
    ...overrides,
  } as any;
}

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let params$: BehaviorSubject<any>;

  beforeEach(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj('Location', ['back']);
    params$ = new BehaviorSubject({ id: '8863' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [ItemDetailsComponent, CommentComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: params$ } },
        { provide: Location, useValue: location },
        { provide: SettingsService, useValue: { settings: { openLinkInNewTab: false } } },
      ],
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('fetches the item for the numeric id route param', () => {
    const story = makeStory();
    api.fetchItemContent.and.returnValue(of(story));

    fixture.detectChanges();

    expect(api.fetchItemContent).toHaveBeenCalledWith(8863);
    expect(component.item).toBe(story);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('renders the item title and its comments', () => {
    api.fetchItemContent.and.returnValue(of(makeStory()));

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.laptop .title').textContent).toContain('My YC app: Dropbox');
    expect(el.querySelector('.laptop .domain').textContent).toContain('getdropbox.com');
    expect(el.querySelector('.laptop .subtext').textContent).toContain('2 comments');
    expect(el.querySelectorAll('.comment-list > li app-comment').length).toBe(2);
  });

  it('renders poll results for poll items', () => {
    api.fetchItemContent.and.returnValue(
      of(makeStory({
        type: 'poll',
        poll: [{ points: 3, content: 'Yes' }, { points: 1, content: 'No' }],
        poll_votes_count: 4,
      }))
    );

    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Yes');
    expect(options[0].querySelector('.pollBar').style.width).toBe('75%');
  });

  it('sets and renders an error message when the item fails to load', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load item comments.');
    expect(fixture.nativeElement.querySelector('app-error-message').textContent)
      .toContain('Could not load item comments.');
  });

  it('goBack() navigates back via Location', () => {
    api.fetchItemContent.and.returnValue(of(makeStory()));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.back-button').click();

    expect(location.back).toHaveBeenCalled();
  });

  describe('hasUrl', () => {
    it('is true for absolute http(s) URLs', () => {
      component.item = makeStory({ url: 'https://example.com' });
      expect(component.hasUrl).toBe(true);

      component.item = makeStory({ url: 'http://example.com' });
      expect(component.hasUrl).toBe(true);
    });

    it('is false for relative HN item URLs', () => {
      component.item = makeStory({ url: 'item?id=8863' });
      expect(component.hasUrl).toBe(false);
    });
  });
});
