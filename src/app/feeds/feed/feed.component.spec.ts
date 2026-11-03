import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';
import {
  ActivatedRouteStub,
  BlankComponent,
  createHackerNewsApiStub,
  createSettingsServiceStub,
  makeStories,
  provideActivatedRoute,
} from '../../../testing/mocks';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let route: ActivatedRouteStub;
  let scrollSpy: jasmine.Spy;

  function setup(params: any, feedType = 'news', stories: Story[] = makeStories(3)) {
    route = new ActivatedRouteStub(params, { feedType });
    api.fetchFeed.and.returnValue(of(stories));
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', component: BlankComponent }]),
        SharedComponentsModule,
        PipesModule,
      ],
      declarations: [FeedComponent, ItemComponent, BlankComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: createSettingsServiceStub() },
        provideActivatedRoute(route),
      ],
    });
    fixture = TestBed.createComponent(FeedComponent);
    el = fixture.nativeElement;
  }

  function render() {
    fixture.detectChanges();
  }

  function navLink(cls: string): HTMLAnchorElement {
    return el.querySelector(`.nav a.${cls}`);
  }

  beforeEach(() => {
    api = createHackerNewsApiStub();
    scrollSpy = spyOn(window, 'scrollTo');
  });

  it('fetches the feed type from route data and the page from route params', () => {
    setup({ page: '1' }, 'news');
    render();
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('defaults to page 1 when there is no page param', () => {
    setup({}, 'show');
    render();
    expect(api.fetchFeed).toHaveBeenCalledWith('show', 1);
  });

  it('renders one item per story, in order', () => {
    setup({ page: '1' });
    render();

    const items = el.querySelectorAll('ol li.post item');
    expect(items.length).toBe(3);
    const titles = Array.from(el.querySelectorAll('ol li.post a.title')).map(a => a.textContent.trim());
    expect(titles).toEqual(['Story 1', 'Story 2', 'Story 3']);
    expect(el.querySelector('ol').getAttribute('start')).toBe('1');
    expect(el.querySelector('app-loader')).toBeNull();
  });

  it('scrolls to the top once the feed has loaded', () => {
    setup({ page: '1' });
    render();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('shows the loader while the feed is loading', () => {
    setup({ page: '1' });
    api.fetchFeed.and.returnValue(NEVER);
    render();

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('ol')).toBeNull();
  });

  it('shows an error message when the feed fails to load', () => {
    setup({ page: '1' }, 'ask');
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message').textContent).toContain('Could not load ask stories.');
  });

  describe('pagination', () => {
    it('shows only a More link on the first full page', () => {
      setup({ page: '1' }, 'news', makeStories(30));
      render();

      expect(navLink('prev')).toBeNull();
      expect(navLink('more').getAttribute('href')).toBe('/news/2');
    });

    it('numbers the list and links both directions on later pages', () => {
      setup({ page: '3' }, 'newest', makeStories(30, 61));
      render();

      expect(api.fetchFeed).toHaveBeenCalledWith('newest', 3);
      expect(el.querySelector('ol').getAttribute('start')).toBe('61');
      expect(navLink('prev').getAttribute('href')).toBe('/newest/2');
      expect(navLink('more').getAttribute('href')).toBe('/newest/4');
    });

    it('hides the More link on a partial (last) page', () => {
      setup({ page: '2' }, 'news', makeStories(12, 31));
      render();

      expect(navLink('more')).toBeNull();
      expect(navLink('prev').getAttribute('href')).toBe('/news/1');
    });

    it('refetches when the page param changes', () => {
      setup({ page: '1' }, 'news', makeStories(30));
      render();

      api.fetchFeed.and.returnValue(of(makeStories(30, 31)));
      route.setParams({ page: '2' });
      render();

      expect(api.fetchFeed.calls.mostRecent().args).toEqual(['news', 2]);
      expect(el.querySelector('ol').getAttribute('start')).toBe('31');
      expect(el.querySelector('ol li.post a.title').textContent.trim()).toBe('Story 31');
    });
  });

  it('shows the jobs header and no list margin on the jobs feed', () => {
    setup({ page: '1' }, 'jobs', makeStories(2).map(s => Object.assign(s, { type: 'job' })));
    render();

    expect(el.querySelector('.job-header').textContent).toContain('Y Combinator');
    expect(el.querySelector('ol').classList).not.toContain('list-margin');
  });

  it('applies the list margin on non-jobs feeds', () => {
    setup({ page: '1' }, 'news');
    render();

    expect(el.querySelector('.job-header')).toBeNull();
    expect(el.querySelector('ol').classList).toContain('list-margin');
  });
});
