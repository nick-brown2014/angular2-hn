import { Location } from '@angular/common';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Comment } from '../shared/models/comment';
import { Story } from '../shared/models/story';
import { createHackerNewsAPIServiceSpy, createSettingsServiceSpy, createStory } from '../shared/testing/mocks';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let params: BehaviorSubject<Params>;

  const comments = [
    { id: 11, user: 'carol', time_ago: '1 hour ago', content: '<p>First comment</p>', deleted: false, comments: [] },
    { id: 12, user: 'dave', time_ago: '30 minutes ago', content: '<p>Second comment</p>', deleted: false, comments: [] }
  ] as Comment[];

  function render(item: Story) {
    api.fetchItemContent.and.returnValue(of(item));
    createFixture();
  }

  function createFixture() {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = createHackerNewsAPIServiceSpy();
    settingsService = createSettingsServiceSpy();
    params = new BehaviorSubject<Params>({ id: '42' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [ItemDetailsComponent, CommentComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: settingsService },
        { provide: ActivatedRoute, useValue: { params } }
      ]
    });
  });

  it('should show the loader while the item is loading', () => {
    api.fetchItemContent.and.returnValue(new Subject<Story>());
    createFixture();

    expect(element.querySelector('app-loader')).toBeTruthy();
    expect(element.querySelector('.item')).toBeNull();
  });

  it('should load the item for the numeric id in the route', () => {
    render(createStory({ id: 42 }));

    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should reload the item when the route id changes', () => {
    render(createStory({ id: 42 }));

    params.next({ id: '43' });

    expect(api.fetchItemContent).toHaveBeenCalledWith(43);
  });

  it('should render the story header', () => {
    render(createStory({
      id: 42,
      title: 'Detailed story',
      url: 'https://example.com/story',
      domain: 'example.com',
      points: 99,
      user: 'erin',
      comments_count: 2
    }));
    const laptop = element.querySelector('.laptop');

    expect(element.querySelector('.mobile .title').textContent.trim()).toBe('Detailed story');
    expect(laptop.querySelector('.title').getAttribute('href')).toBe('https://example.com/story');
    expect(laptop.querySelector('.domain').textContent).toBe('(example.com)');
    expect(laptop.querySelector('.subtext').textContent).toContain('99 points by');
    expect(laptop.querySelector('a[href="/user/erin"]').textContent).toBe('erin');
    expect(laptop.querySelector('a[href="/item/42"]').textContent.trim()).toBe('2 comments');
    expect(laptop.classList).toContain('item-header');
  });

  it('should link internal stories to the item page', () => {
    render(createStory({ id: 42, title: 'Ask HN', url: 'item?id=42', domain: undefined }));

    expect(element.querySelector('.laptop .title').getAttribute('href')).toBe('/item/42');
    expect(element.querySelector('.laptop .domain')).toBeNull();
  });

  it('should open the story in a new tab when enabled in settings', () => {
    settingsService.settings.openLinkInNewTab = true;
    render(createStory());

    const title = element.querySelector('.laptop .title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('should render the story text and its comments', () => {
    render(createStory({ comments, comments_count: 2, content: '<p>Story body</p>' } as Partial<Story>));

    const renderedComments = element.querySelectorAll('.comment-list > li > app-comment');
    expect(element.querySelector('.subject').textContent).toBe('Story body');
    expect(renderedComments.length).toBe(2);
    expect(renderedComments[0].querySelector('.comment-text').textContent).toBe('First comment');
    expect(renderedComments[1].querySelector('.meta a').textContent).toBe('dave');
  });

  it('should render poll results relative to the total votes', () => {
    render(createStory({
      type: 'poll',
      poll: [{ points: 30, content: 'Yes' }, { points: 10, content: 'No' }],
      poll_votes_count: 40
    }));

    const options = element.querySelectorAll('.pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Yes');
    expect(options[0].querySelector('.subtext').textContent).toBe('30 points');
    expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
    expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
  });

  it('should hide the byline and comment count for jobs', () => {
    render(createStory({ type: 'job', user: 'erin' }));

    expect(element.querySelector('.laptop a[href="/user/erin"]')).toBeNull();
    expect(element.querySelector('.laptop').classList).toContain('item-header');
  });

  it('should navigate back when the back button is clicked', () => {
    render(createStory());
    const location = TestBed.inject(Location);
    spyOn(location, 'back');

    (element.querySelector('.back-button') as HTMLElement).click();

    expect(location.back).toHaveBeenCalled();
  });

  it('should show an error message when the item fails to load', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));
    createFixture();

    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('app-error-message .strong').textContent).toBe('Could not load item comments.');
  });
});
