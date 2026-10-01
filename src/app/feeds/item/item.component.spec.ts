import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { createSettings, createSettingsServiceSpy, createStory } from '../../../testing/mocks';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settings: Settings;
  let el: HTMLElement;

  beforeEach(() => {
    settings = createSettings({ titleFontSize: '20', listSpacing: '6' });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: createSettingsServiceSpy(settings) }],
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('links external stories to their url and shows the domain', () => {
    component.item = createStory({ url: 'https://example.com/a', domain: 'example.com' });
    fixture.detectChanges();

    expect(component.hasUrl).toBe(true);
    const title: HTMLAnchorElement = el.querySelector('a.title');
    expect(title.href).toBe('https://example.com/a');
    expect(title.getAttribute('target')).toBeNull();
    expect(el.querySelector('.domain').textContent).toBe('(example.com)');
  });

  it('links internal (Ask HN) stories to the item page', () => {
    component.item = createStory({ id: 77, url: 'item?id=77', domain: undefined });
    fixture.detectChanges();

    expect(component.hasUrl).toBe(false);
    expect(el.querySelector('a.title').getAttribute('href')).toBe('/item/77');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('opens links in a new tab when the setting is enabled', () => {
    settings.openLinkInNewTab = true;
    component.item = createStory();
    fixture.detectChanges();

    const title: HTMLAnchorElement = el.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('applies font size and list spacing from settings', () => {
    component.item = createStory();
    fixture.detectChanges();

    expect((el.querySelector('a.title') as HTMLElement).style.fontSize).toBe('20px');
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('6px');
  });

  it('renders points, author link and the comment count', () => {
    component.item = createStory({ id: 5, user: 'dang', points: 99, comments_count: 1 });
    fixture.detectChanges();

    const laptop = el.querySelector('.subtext-laptop');
    expect(laptop.textContent).toContain('99 points by');
    expect(laptop.querySelector('a[href="/user/dang"]').textContent).toBe('dang');
    expect(laptop.querySelector('a[href="/item/5"]').textContent.trim()).toBe('1 comment');
  });

  it('hides author, points and comments for jobs', () => {
    component.item = createStory({ type: 'job' });
    fixture.detectChanges();

    expect(el.querySelector('a[href^="/user/"]')).toBeNull();
    expect(el.querySelector('.comment-number')).toBeNull();
    expect(el.querySelector('.subtext-laptop').textContent).not.toContain('points by');
  });
});
