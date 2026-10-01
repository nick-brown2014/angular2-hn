import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { createComment, createHackerNewsAPIServiceSpy, createSettingsServiceSpy, createStory } from '../../testing/mocks';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let el: HTMLElement;

  beforeEach(() => {
    api = createHackerNewsAPIServiceSpy();
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemDetailsComponent, CommentComponent, CommentPipe, LoaderComponent, ErrorMessageComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: createSettingsServiceSpy() },
        { provide: ActivatedRoute, useValue: { params: of({ id: '42' }) } },
        { provide: Location, useValue: location },
      ],
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('shows the loader while the item is loading', () => {
    api.fetchItemContent.and.returnValue(NEVER);
    fixture.detectChanges();

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.item')).toBeNull();
  });

  it('fetches the item for the route id and scrolls to top', () => {
    api.fetchItemContent.and.returnValue(of(createStory({ id: 42 })));
    fixture.detectChanges();

    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('renders the story header, content and top-level comments', () => {
    const comments = [createComment({ id: 1, user: 'alice' }), createComment({ id: 2, user: 'bob' })];
    api.fetchItemContent.and.returnValue(
      of(Object.assign(createStory({ id: 42, title: 'Hello HN', comments, comments_count: 2 }), { content: '<p>Body</p>' }))
    );
    fixture.detectChanges();

    expect(el.querySelector('.laptop a.title').textContent.trim()).toBe('Hello HN');
    expect(el.querySelector('.subject').innerHTML).toBe('<p>Body</p>');
    const rendered = el.querySelectorAll('ul.comment-list > li > app-comment');
    expect(rendered.length).toBe(2);
    expect(rendered[1].querySelector('.meta a').textContent).toBe('bob');
    expect(el.querySelector('.subtext').textContent).toContain('2 comments');
  });

  it('links internal items to themselves', () => {
    api.fetchItemContent.and.returnValue(of(createStory({ id: 42, url: 'item?id=42' })));
    fixture.detectChanges();

    expect(component.hasUrl).toBe(false);
    expect(el.querySelector('.laptop a.title').getAttribute('href')).toBe('/item/42');
  });

  it('renders poll results with proportional bars', () => {
    api.fetchItemContent.and.returnValue(
      of(
        createStory({
          type: 'poll',
          poll: [{ points: 3, content: 'Yes' }, { points: 1, content: 'No' }],
          poll_votes_count: 4,
        })
      )
    );
    fixture.detectChanges();

    const options = el.querySelectorAll('.pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Yes');
    expect(options[0].querySelector('.subtext').textContent).toBe('3 points');
    expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
  });

  it('shows an error message when the item fails to load', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));
    fixture.detectChanges();

    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load item comments.');
    expect(el.querySelector('app-loader')).toBeNull();
  });

  it('navigates back with the back button', () => {
    api.fetchItemContent.and.returnValue(of(createStory()));
    fixture.detectChanges();

    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });
});
