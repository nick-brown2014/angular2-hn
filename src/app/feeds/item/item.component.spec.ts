import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 8863,
    title: 'My YC app: Dropbox - Throw away your USB drive',
    points: 104,
    user: 'dhouston',
    time: 1175714200,
    time_ago: '10 years ago' as any,
    type: 'story',
    url: 'http://www.getdropbox.com/u/2/screencast.html',
    domain: 'getdropbox.com',
    comments: [],
    comments_count: 71,
    poll: null,
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let el: HTMLElement;
  let settings: Settings;

  function render(item: Story) {
    fixture.componentInstance.item = item;
    fixture.detectChanges();
  }

  beforeEach(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: { settings } }],
    });

    fixture = TestBed.createComponent(ItemComponent);
    el = fixture.nativeElement;
  });

  it('creates', () => {
    render(createStory());
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('story with an external url', () => {
    beforeEach(() => render(createStory()));

    it('links the title to the external url', () => {
      const title: HTMLAnchorElement = el.querySelector('a.title');
      expect(title.textContent.trim()).toBe('My YC app: Dropbox - Throw away your USB drive');
      expect(title.getAttribute('href')).toBe('http://www.getdropbox.com/u/2/screencast.html');
      expect(title.hasAttribute('target')).toBe(false);
    });

    it('shows the domain', () => {
      expect(el.querySelector('.domain').textContent).toBe('(getdropbox.com)');
    });

    it('shows score, author, age and comment count', () => {
      const laptop = el.querySelector('.subtext-laptop').textContent.replace(/\s+/g, ' ');
      expect(laptop).toContain('104 points by dhouston');
      expect(laptop).toContain('10 years ago');
      expect(laptop).toContain('71 comments');

      expect(el.querySelector('.subtext-palm .right').textContent).toBe('104 ★');
      expect(el.querySelector('.subtext-palm .name a').textContent).toBe('dhouston');
    });

    it('links the author to their profile and the comment count to the item', () => {
      const links = Array.from(el.querySelectorAll('.subtext-laptop a')).map(a => a.getAttribute('href'));
      expect(links).toEqual(['/user/dhouston', '/item/8863']);
    });
  });

  it('links the title to the item page for self posts', () => {
    render(createStory({ url: 'item?id=8863', domain: undefined }));

    const title: HTMLAnchorElement = el.querySelector('a.title');
    expect(title.getAttribute('href')).toBe('/item/8863');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('shows "discuss" when there are no comments', () => {
    render(createStory({ comments_count: 0 }));
    expect(el.querySelector('.subtext-laptop').textContent).toContain('discuss');
  });

  it('uses the singular form for a single comment', () => {
    render(createStory({ comments_count: 1 }));
    expect(el.querySelector('.subtext-laptop').textContent).toContain('1 comment');
    expect(el.querySelector('.subtext-laptop').textContent).not.toContain('1 comments');
  });

  it('hides author, score and comments for jobs', () => {
    render(createStory({ type: 'job', user: undefined, points: null }));

    expect(el.querySelector('.subtext-palm .name')).toBeNull();
    expect(el.querySelector('.comment-number')).toBeNull();
    const laptop = el.querySelector('.subtext-laptop').textContent;
    expect(laptop).not.toContain('points by');
    expect(laptop).toContain('10 years ago');
  });

  it('opens external links in a new tab when enabled in settings', () => {
    settings.openLinkInNewTab = true;
    render(createStory());

    const title: HTMLAnchorElement = el.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('applies the title font size and list spacing from settings', () => {
    settings.titleFontSize = '22';
    settings.listSpacing = '10';
    render(createStory());

    expect((el.querySelector('a.title') as HTMLElement).style.fontSize).toBe('22px');
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('10px');
  });
});
