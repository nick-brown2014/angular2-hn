import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';
import { createSettingsServiceSpy, createStory } from '../../shared/testing/mocks';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let element: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  function render(item: Story) {
    fixture = TestBed.createComponent(ItemComponent);
    fixture.componentInstance.item = item;
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  function title(): HTMLAnchorElement {
    return element.querySelector('a.title');
  }

  beforeEach(() => {
    settingsService = createSettingsServiceSpy();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    });
  });

  it('should link the title to an external story url and show its domain', () => {
    render(createStory({ id: 7, title: 'External story', url: 'https://example.com/a', domain: 'example.com' }));

    expect(title().textContent.trim()).toBe('External story');
    expect(title().getAttribute('href')).toBe('https://example.com/a');
    expect(element.querySelector('.domain').textContent).toBe('(example.com)');
  });

  it('should link the title to the item page for internal stories', () => {
    render(createStory({ id: 9, title: 'Ask HN: Something?', url: 'item?id=9', domain: undefined }));

    expect(title().getAttribute('href')).toBe('/item/9');
    expect(element.querySelector('.domain')).toBeNull();
  });

  it('should render the byline, points and comment count', () => {
    render(createStory({ id: 3, user: 'bob', points: 120, time_ago: '3 hours ago' as unknown as number, comments_count: 1 }));
    const laptop = element.querySelector('.subtext-laptop');
    const userLink = laptop.querySelector('a[href="/user/bob"]');
    const commentLink = laptop.querySelector('a[href="/item/3"]');

    expect(laptop.textContent).toContain('120 points by');
    expect(laptop.textContent).toContain('3 hours ago');
    expect(userLink.textContent).toBe('bob');
    expect(commentLink.textContent.trim()).toBe('1 comment');
    expect(element.querySelector('.subtext-palm .right').textContent).toBe('120 ★');
    expect(element.querySelector('.subtext-palm .comment-number').textContent).toContain('1 comment');
  });

  it('should prompt discussion when there are no comments', () => {
    render(createStory({ comments_count: 0 }));

    expect(element.querySelector('.subtext-palm .comment-number').textContent).toContain('discuss');
  });

  it('should hide the byline and comments for jobs', () => {
    render(createStory({ type: 'job', time_ago: '1 day ago' as unknown as number }));

    expect(element.querySelector('.subtext-palm .name')).toBeNull();
    expect(element.querySelector('.comment-number')).toBeNull();
    expect(element.querySelector('.subtext-laptop').textContent.trim()).toBe('1 day ago');
  });

  it('should open external links in the current tab by default', () => {
    render(createStory());

    expect(title().hasAttribute('target')).toBe(false);
    expect(title().hasAttribute('rel')).toBe(false);
  });

  it('should open external links in a new tab when enabled in settings', () => {
    settingsService.settings.openLinkInNewTab = true;
    render(createStory());

    expect(title().getAttribute('target')).toBe('_blank');
    expect(title().getAttribute('rel')).toBe('noopener');
  });

  it('should apply the title font size and list spacing from settings', () => {
    settingsService.settings.titleFontSize = '22';
    settingsService.settings.listSpacing = '6';
    render(createStory());

    expect(title().style.fontSize).toBe('22px');
    expect((element.firstElementChild as HTMLElement).style.marginBottom).toBe('6px');
  });
});
