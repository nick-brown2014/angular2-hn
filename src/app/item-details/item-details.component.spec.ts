import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';

function createItem(overrides: Partial<Story> & { content?: string } = {}): Story {
  return {
    id: 123,
    title: 'Show HN: A thing I built',
    points: 256,
    user: 'builder',
    time: 1600000000,
    time_ago: '3 hours ago' as any,
    type: 'story',
    url: 'https://example.com/thing',
    domain: 'example.com',
    comments_count: 3,
    poll: null,
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    content: '',
    comments: [
      {
        id: 1,
        level: 0,
        user: 'alice',
        time: 1600000100,
        time_ago: '2 hours ago',
        content: '<p>Looks great!</p>',
        deleted: false,
        comments: [
          {
            id: 2,
            level: 1,
            user: 'builder',
            time: 1600000200,
            time_ago: '1 hour ago',
            content: '<p>Thanks!</p>',
            deleted: false,
            comments: [],
          },
        ],
      },
      { id: 3, level: 0, user: 'bob', time: 1600000300, time_ago: '30 minutes ago', content: '<p>Nice</p>', deleted: false, comments: [] },
    ],
    ...overrides,
  } as Story;
}

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let routeParams: BehaviorSubject<any>;
  let settings: Settings;

  function render() {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    routeParams = new BehaviorSubject({ id: '123' });
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [ItemDetailsComponent, CommentComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: routeParams } },
        { provide: SettingsService, useValue: { settings } },
      ],
    });
  });

  it('shows the loader while the item is loading', () => {
    api.fetchItemContent.and.returnValue(NEVER);
    render();

    expect(el.querySelector('app-loader')).toBeTruthy();
    expect(el.querySelector('.item')).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('fetches the item for the numeric route id', () => {
    api.fetchItemContent.and.returnValue(of(createItem()));
    render();

    expect(api.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('renders the item title, domain, score, author and comment count', () => {
    api.fetchItemContent.and.returnValue(of(createItem()));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    const laptop = el.querySelector('.laptop');
    const title: HTMLAnchorElement = laptop.querySelector('a.title');
    expect(title.textContent.trim()).toBe('Show HN: A thing I built');
    expect(title.getAttribute('href')).toBe('https://example.com/thing');
    expect(laptop.querySelector('.domain').textContent).toBe('(example.com)');

    const subtext = laptop.querySelector('.subtext').textContent.replace(/\s+/g, ' ');
    expect(subtext).toContain('256 points by builder');
    expect(subtext).toContain('3 hours ago');
    expect(subtext).toContain('3 comments');
  });

  it('links self posts to the item page and renders their text', () => {
    api.fetchItemContent.and.returnValue(
      of(createItem({ url: 'item?id=123', domain: undefined, content: '<p>Ask HN body</p>' }))
    );
    render();

    expect(el.querySelector('.laptop a.title').getAttribute('href')).toBe('/item/123');
    expect(el.querySelector('.subject').textContent).toBe('Ask HN body');
  });

  it('renders top-level and nested comments', () => {
    api.fetchItemContent.and.returnValue(of(createItem()));
    render();

    const topLevel = el.querySelectorAll('ul.comment-list > li > app-comment');
    expect(topLevel.length).toBe(2);

    const authors = Array.from(el.querySelectorAll('app-comment .meta a')).map(a => a.textContent);
    expect(authors).toEqual(['alice', 'builder', 'bob']);

    const nested = topLevel[0].querySelector('.subtree app-comment .comment-text');
    expect(nested.textContent).toBe('Thanks!');
  });

  it('renders poll options with their points', () => {
    api.fetchItemContent.and.returnValue(
      of(
        createItem({
          type: 'poll',
          url: 'item?id=123',
          poll: [
            { points: 25, content: 'Tabs' },
            { points: 75, content: 'Spaces' },
          ],
          poll_votes_count: 100,
        })
      )
    );
    render();

    const options = el.querySelectorAll('.pollResults .pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Tabs');
    expect(options[0].querySelector('.subtext').textContent).toBe('25 points');
    expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
  });

  it('hides author and comment count for jobs', () => {
    api.fetchItemContent.and.returnValue(of(createItem({ type: 'job', comments: [], comments_count: 0 })));
    render();

    const subtext = el.querySelector('.laptop .subtext').textContent;
    expect(subtext).not.toContain('points by');
    expect(subtext).toContain('3 hours ago');
  });

  it('opens external links in a new tab when enabled in settings', () => {
    settings.openLinkInNewTab = true;
    api.fetchItemContent.and.returnValue(of(createItem()));
    render();

    const title = el.querySelector('.laptop a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('shows an error message when the item fails to load', () => {
    api.fetchItemContent.and.returnValue(throwError('offline'));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.item')).toBeNull();
    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load item comments.');
  });

  it('navigates back when the back button is clicked', () => {
    api.fetchItemContent.and.returnValue(of(createItem()));
    render();
    const back = spyOn(TestBed.inject(Location), 'back');

    (el.querySelector('.back-button') as HTMLElement).click();
    expect(back).toHaveBeenCalled();
  });
});
