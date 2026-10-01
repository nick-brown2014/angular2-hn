import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';
import { mockComment, mockPollResult, mockSettings, mockStory } from '../testing/mock-data';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let settings: Settings;
  let routeParams: BehaviorSubject<{ id: string }>;

  function render(story?: Story) {
    if (story) {
      api.fetchItemContent.and.returnValue(of(story));
    }
    fixture = TestBed.createComponent(ItemDetailsComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  const laptopTitle = () => element.querySelector<HTMLAnchorElement>('.laptop a.title');

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    settings = mockSettings();
    routeParams = new BehaviorSubject({ id: '8863' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [ItemDetailsComponent, CommentComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: routeParams } },
        { provide: Location, useValue: location }
      ]
    });
  });

  it('fetches the item using the numeric id from the route', () => {
    render(mockStory({ id: 8863 }));

    expect(api.fetchItemContent).toHaveBeenCalledWith(8863);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows the loader until the item arrives', () => {
    api.fetchItemContent.and.returnValue(new Subject<Story>());

    render();

    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('.item')).toBeNull();
  });

  it('shows an error message when the item fails to load', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));

    render();

    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('app-error-message .strong').textContent).toBe('Could not load item comments.');
  });

  it('renders the story header with external link, domain, author and comment count', () => {
    render(
      mockStory({
        id: 8863,
        title: 'My YC app: Dropbox',
        url: 'http://www.getdropbox.com/u/2/screencast.html',
        domain: 'getdropbox.com',
        user: 'dhouston',
        points: 111,
        comments_count: 71
      })
    );

    expect(laptopTitle().textContent.trim()).toBe('My YC app: Dropbox');
    expect(laptopTitle().getAttribute('href')).toBe('http://www.getdropbox.com/u/2/screencast.html');
    expect(element.querySelector('.laptop .domain').textContent).toBe('(getdropbox.com)');
    expect(element.querySelector('.laptop .subtext').textContent).toContain('111 points by');
    expect(element.querySelector('.laptop .subtext a[href="/user/dhouston"]')).not.toBeNull();
    expect(element.querySelector('.laptop .subtext a[href="/item/8863"]').textContent.trim()).toBe('71 comments');
  });

  it('opens external links in a new tab when configured', () => {
    settings.openLinkInNewTab = true;
    render(mockStory());

    expect(laptopTitle().getAttribute('target')).toBe('_blank');
    expect(laptopTitle().getAttribute('rel')).toBe('noopener');
  });

  it('links self posts back to the item route and renders their content', () => {
    const story = mockStory({ id: 121003, url: 'item?id=121003', domain: undefined });
    (story as Story & { content: string }).content = '<p>Ask HN: <b>what</b> are you working on?</p>';
    render(story);

    expect(fixture.componentInstance.hasUrl).toBe(false);
    expect(laptopTitle().getAttribute('href')).toBe('/item/121003');
    expect(element.querySelector('.subject b').textContent).toBe('what');
  });

  it('renders the full comment tree', () => {
    render(
      mockStory({
        comments: [
          mockComment({ id: 1, user: 'alice', comments: [mockComment({ id: 2, user: 'bob' })] }),
          mockComment({ id: 3, user: 'carol' }),
          mockComment({ id: 4, deleted: true })
        ]
      })
    );

    const topLevel = element.querySelectorAll('ul.comment-list > li > app-comment');
    expect(topLevel.length).toBe(3);
    expect(element.querySelectorAll('app-comment').length).toBe(4);
    expect(Array.from(element.querySelectorAll('.meta a')).map(a => a.textContent)).toEqual([
      'alice',
      'bob',
      'carol'
    ]);
    expect(element.querySelectorAll('.deleted-meta').length).toBe(1);
  });

  it('renders poll results with proportional bars', () => {
    render(
      mockStory({
        type: 'poll',
        poll: [mockPollResult({ content: 'Vim', points: 75 }), mockPollResult({ content: 'Emacs', points: 25 })],
        poll_votes_count: 100
      })
    );

    const options = element.querySelectorAll<HTMLElement>('.pollResults .pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Vim');
    expect(options[0].querySelector('.subtext').textContent).toBe('75 points');
    expect(options[0].querySelector<HTMLElement>('.pollBar').style.width).toBe('75%');
    expect(options[1].querySelector<HTMLElement>('.pollBar').style.width).toBe('25%');
  });

  it('hides author and comment links for jobs', () => {
    render(mockStory({ type: 'job' }));

    expect(element.querySelector('.laptop .subtext').textContent).not.toContain('points by');
    expect(element.querySelector('.laptop .subtext a')).toBeNull();
    expect(element.querySelector('.pollResults')).toBeNull();
  });

  it('navigates back when the back button is clicked', () => {
    render(mockStory());

    element.querySelector<HTMLElement>('.back-button').click();

    expect(location.back).toHaveBeenCalled();
  });
});
