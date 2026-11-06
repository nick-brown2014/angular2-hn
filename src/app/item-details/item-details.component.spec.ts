import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import {
  ActivatedRouteStub,
  createHackerNewsApiSpy,
  createSettingsServiceSpy,
  makeComment,
  makeSettings,
  makeStory,
  StoryFixture,
} from '../../testing/mocks';

@Component({ template: '' })
class BlankComponent {}

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let route: ActivatedRouteStub;
  let location: jasmine.SpyObj<Location>;
  let settings: Settings;

  function render(story: StoryFixture | null) {
    if (story) {
      api.fetchItemContent.and.returnValue(of(makeStory(story)));
    }
    fixture = TestBed.createComponent(ItemDetailsComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  function laptopTitle(): HTMLAnchorElement {
    return el.querySelector('.laptop a.title');
  }

  beforeEach(() => {
    api = createHackerNewsApiSpy();
    route = new ActivatedRouteStub({ id: '123' });
    location = jasmine.createSpyObj('Location', ['back']);
    settings = makeSettings();
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', component: BlankComponent }]),
        SharedComponentsModule,
        PipesModule,
      ],
      declarations: [ItemDetailsComponent, CommentComponent, BlankComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: createSettingsServiceSpy(settings) },
        { provide: ActivatedRoute, useValue: route },
        { provide: Location, useValue: location },
      ],
    });
  });

  it('fetches the item whose id is in the route, as a number, and scrolls to the top', () => {
    api.fetchItemContent.and.returnValue(NEVER);
    render(null);

    expect(api.fetchItemContent).toHaveBeenCalledWith(123);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows the loader while loading', () => {
    api.fetchItemContent.and.returnValue(NEVER);
    render(null);

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.item')).toBeNull();
  });

  it('shows an error when the item cannot be loaded', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('boom')));
    render(null);

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load item comments.');
  });

  it('renders the story header, content and top-level comments', () => {
    render({
      id: 123,
      title: 'Big news',
      url: 'https://news.example/big',
      domain: 'news.example',
      points: 250,
      user: 'jl',
      time_ago: '4 hours ago',
      comments_count: 2,
      content: '<p>Body <b>text</b></p>',
      comments: [makeComment({ id: 1, user: 'a' }), makeComment({ id: 2, user: 'b' })],
    } as StoryFixture);

    expect(el.querySelector('.mobile a.title').textContent.trim()).toBe('Big news');
    expect(laptopTitle().textContent.trim()).toBe('Big news');
    expect(laptopTitle().getAttribute('href')).toBe('https://news.example/big');
    expect(el.querySelector('.laptop .domain').textContent).toBe('(news.example)');
    expect(el.querySelector('.laptop .subtext').textContent.replace(/\s+/g, ' ').trim())
      .toBe('250 points by jl 4 hours ago | 2 comments');
    expect(el.querySelector('.subject b').textContent).toBe('text');
    expect(el.querySelectorAll('.comment-list > li > app-comment').length).toBe(2);
    expect(el.querySelector('.laptop').classList).toContain('item-header');
  });

  it('links the title to the item itself for self posts', () => {
    render({ id: 123, title: 'Ask HN: Anything?', url: 'item?id=123', domain: undefined });

    expect(fixture.componentInstance.hasUrl).toBe(false);
    expect(laptopTitle().getAttribute('href')).toBe('/item/123');
    expect(el.querySelector('.mobile a.title').getAttribute('href')).toBe('/item/123');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('opens the external link in a new tab when the setting is on', () => {
    settings.openLinkInNewTab = true;
    render({ url: 'https://example.com' });

    for (const link of Array.from(el.querySelectorAll('a.title'))) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener');
    }
  });

  it('hides points, author and comment count for jobs', () => {
    render({ type: 'job', time_ago: '2 days ago', comments_count: 0 });

    expect(el.querySelector('.laptop .subtext').textContent.replace(/\s+/g, ' ').trim()).toBe('2 days ago');
    expect(el.querySelector('.laptop').classList).toContain('item-header');
  });

  it('renders poll options with bars proportional to their share of the votes', () => {
    render({
      type: 'poll',
      poll: [{ points: 30, content: '<p>Yes</p>' }, { points: 10, content: '<p>No</p>' }],
      poll_votes_count: 40,
    });

    const options = Array.from(el.querySelectorAll<HTMLElement>('.pollResults .pollContent'));
    expect(options.map(o => o.querySelector('p').textContent)).toEqual(['Yes', 'No']);
    expect(options.map(o => o.querySelector('.subtext').textContent)).toEqual(['30 points', '10 points']);
    expect(options.map(o => (o.querySelector('.pollBar') as HTMLElement).style.width)).toEqual(['75%', '25%']);
  });

  it('does not render a poll section for regular stories', () => {
    render({});
    expect(el.querySelector('.pollResults')).toBeNull();
  });

  it('goes back when the back button is clicked', () => {
    render({});
    (el.querySelector('.back-button') as HTMLElement).click();

    expect(location.back).toHaveBeenCalled();
  });

  it('loads the new item when the route id changes', () => {
    render({ id: 123, title: 'First' });

    api.fetchItemContent.and.returnValue(of(makeStory({ id: 456, title: 'Second' })));
    route.params.next({ id: '456' });
    fixture.detectChanges();

    expect(api.fetchItemContent).toHaveBeenCalledWith(456);
    expect(laptopTitle().textContent.trim()).toBe('Second');
  });
});
