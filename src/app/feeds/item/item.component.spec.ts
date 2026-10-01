import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';
import { mockSettings, mockStory } from '../../testing/mock-data';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let element: HTMLElement;
  let settings: Settings;

  function render(item: Story) {
    fixture = TestBed.createComponent(ItemComponent);
    fixture.componentInstance.item = item;
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  const title = () => element.querySelector<HTMLAnchorElement>('a.title');
  const laptopLinks = () => Array.from(element.querySelectorAll<HTMLAnchorElement>('.subtext-laptop a'));

  beforeEach(() => {
    settings = mockSettings();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings } }]
    });
  });

  describe('external stories', () => {
    it('links the title to the story URL and shows the domain', () => {
      render(mockStory({ title: 'Rust 2.0', url: 'https://blog.rust-lang.org/2', domain: 'rust-lang.org' }));

      expect(fixture.componentInstance.hasUrl).toBe(true);
      expect(title().textContent.trim()).toBe('Rust 2.0');
      expect(title().getAttribute('href')).toBe('https://blog.rust-lang.org/2');
      expect(element.querySelector('.domain').textContent).toBe('(rust-lang.org)');
    });

    it('omits the domain when the story has none', () => {
      render(mockStory({ domain: undefined }));
      expect(element.querySelector('.domain')).toBeNull();
    });

    it('opens in the same tab by default', () => {
      render(mockStory());

      expect(title().hasAttribute('target')).toBe(false);
      expect(title().hasAttribute('rel')).toBe(false);
    });

    it('opens in a new tab when openLinkInNewTab is enabled', () => {
      settings.openLinkInNewTab = true;
      render(mockStory());

      expect(title().getAttribute('target')).toBe('_blank');
      expect(title().getAttribute('rel')).toBe('noopener');
    });
  });

  describe('self posts', () => {
    it('links the title to the item details route', () => {
      render(mockStory({ id: 4242, url: 'item?id=4242', domain: undefined }));

      expect(fixture.componentInstance.hasUrl).toBe(false);
      expect(title().getAttribute('href')).toBe('/item/4242');
    });
  });

  describe('metadata', () => {
    it('shows points, author link and comment count for stories', () => {
      render(mockStory({ id: 77, points: 321, user: 'tptacek', comments_count: 1 }));
      const subtext = element.querySelector('.subtext-laptop').textContent;

      expect(subtext).toContain('321 points by');
      expect(laptopLinks().map(a => a.getAttribute('href'))).toEqual(['/user/tptacek', '/item/77']);
      expect(laptopLinks()[1].textContent.trim()).toBe('1 comment');
      expect(element.querySelector('.subtext-palm .right').textContent).toBe('321 ★');
    });

    it('shows "discuss" when a story has no comments', () => {
      render(mockStory({ comments_count: 0 }));
      expect(element.querySelector('.comment-number').textContent).toContain('discuss');
    });

    it('hides author, points and comments for jobs', () => {
      render(mockStory({ type: 'job', time_ago: 5 }));

      expect(element.querySelector('.subtext-laptop').textContent).not.toContain('points by');
      expect(laptopLinks().length).toBe(0);
      expect(element.querySelector('.comment-number')).toBeNull();
      expect(element.querySelector('.subtext-laptop').textContent).toContain('5');
    });
  });

  describe('display settings', () => {
    it('applies the title font size and list spacing', () => {
      settings.titleFontSize = '22';
      settings.listSpacing = '6';
      render(mockStory());

      expect(title().style.fontSize).toBe('22px');
      expect(element.querySelector<HTMLElement>('div').style.marginBottom).toBe('6px');
    });
  });
});
