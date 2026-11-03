import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import {
  ActivatedRouteStub,
  createHackerNewsApiStub,
  createSettingsServiceStub,
  makeComment,
  makeStory,
  provideActivatedRoute,
} from '../../testing/mocks';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let route: ActivatedRouteStub;
  let location: jasmine.SpyObj<Location>;

  const story = makeStory({
    id: 8863,
    title: 'My YC app: Dropbox',
    url: 'http://www.getdropbox.com/u/2/screencast.html',
    domain: 'getdropbox.com',
    points: 111,
    user: 'dhouston',
    time_ago: '19 years ago',
    comments_count: 3,
    comments: [
      makeComment({
        id: 1,
        user: 'brett',
        content: '<p>Top comment</p>',
        comments: [makeComment({ id: 2, level: 1, user: 'dhouston', content: '<p>Reply</p>' })],
      }),
      makeComment({ id: 3, user: 'pg', content: '<p>Second top comment</p>' }),
    ],
  });

  function text(selector: string): string {
    return el.querySelector(selector).textContent.replace(/\s+/g, ' ').trim();
  }

  beforeEach(() => {
    api = createHackerNewsApiStub();
    api.fetchItemContent.and.returnValue(of(story));
    route = new ActivatedRouteStub({ id: '8863' });
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [ItemDetailsComponent, CommentComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: createSettingsServiceStub() },
        { provide: Location, useValue: location },
        provideActivatedRoute(route),
      ],
    });
    fixture = TestBed.createComponent(ItemDetailsComponent);
    el = fixture.nativeElement;
  });

  it('loads the story for the numeric route id', () => {
    fixture.detectChanges();
    expect(api.fetchItemContent).toHaveBeenCalledWith(8863);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('reloads when the route id changes', () => {
    fixture.detectChanges();
    api.fetchItemContent.and.returnValue(of(makeStory({ id: 42, title: 'Another story' })));

    route.setParams({ id: '42' });
    fixture.detectChanges();

    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(text('.laptop a.title')).toBe('Another story');
  });

  it('shows the loader while the story is loading', () => {
    api.fetchItemContent.and.returnValue(NEVER);
    fixture.detectChanges();

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.item')).toBeNull();
  });

  it('shows an error message when the story fails to load', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));
    fixture.detectChanges();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(text('app-error-message .strong')).toBe('Could not load item comments.');
  });

  it('renders the story header', () => {
    fixture.detectChanges();

    const title: HTMLAnchorElement = el.querySelector('.laptop a.title');
    expect(title.textContent.trim()).toBe('My YC app: Dropbox');
    expect(title.getAttribute('href')).toBe('http://www.getdropbox.com/u/2/screencast.html');
    expect(text('.mobile a.title')).toBe('My YC app: Dropbox');
    expect(text('.laptop .domain')).toBe('(getdropbox.com)');
    expect(text('.laptop .subtext')).toBe('111 points by dhouston 19 years ago | 3 comments');
    expect(el.querySelector('.laptop .subtext a').getAttribute('href')).toBe('/user/dhouston');
  });

  it('renders the top-level comments and their nested replies', () => {
    fixture.detectChanges();

    const topLevel = el.querySelectorAll('ul.comment-list > li > app-comment');
    expect(topLevel.length).toBe(2);
    expect(Array.from(topLevel).map(c => c.querySelector('.meta a').textContent)).toEqual(['brett', 'pg']);

    const reply = topLevel[0].querySelector('.subtree app-comment');
    expect(reply.querySelector('.comment-text').textContent).toBe('Reply');
    expect(el.querySelectorAll('app-comment').length).toBe(3);
  });

  it('links self posts to the item page and renders their text', () => {
    api.fetchItemContent.and.returnValue(
      of(makeStory({
        id: 121003,
        title: 'Ask HN: The Arc Effect',
        url: 'item?id=121003',
        domain: undefined,
        content: '<p>Body text</p>',
      } as any))
    );
    fixture.detectChanges();

    expect(el.querySelector('.laptop a.title').getAttribute('href')).toBe('/item/121003');
    expect(el.querySelector('.laptop .domain')).toBeNull();
    expect(text('.subject')).toBe('Body text');
  });

  it('renders poll options with proportional bars', () => {
    api.fetchItemContent.and.returnValue(
      of(makeStory({
        type: 'poll',
        poll: [{ content: 'Yes', points: 30 }, { content: 'No', points: 10 }],
        poll_votes_count: 40,
      }))
    );
    fixture.detectChanges();

    const options = el.querySelectorAll('.pollResults .pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Yes');
    expect(options[0].querySelector('.subtext').textContent).toBe('30 points');
    expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
    expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
  });

  it('goes back when the back button is clicked', () => {
    fixture.detectChanges();
    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });
});
