import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settings: Settings;

  function makeStory(overrides: Partial<Story> = {}): Story {
    return {
      id: 8863,
      title: 'My YC app: Dropbox',
      points: 111,
      user: 'dhouston',
      time_ago: '14 years ago',
      type: 'link',
      url: 'http://www.getdropbox.com/u/2/screencast.html',
      domain: 'getdropbox.com',
      comments_count: 71,
      ...overrides,
    } as any;
  }

  function render(story: Story): HTMLElement {
    component.item = story;
    fixture.detectChanges();
    return fixture.nativeElement;
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
    component = fixture.componentInstance;
  });

  it('should create', () => {
    render(makeStory());
    expect(component).toBeTruthy();
  });

  it('renders an external story with title, domain, points, user and comment count', () => {
    const el = render(makeStory());

    const title = el.querySelector('a.title') as HTMLAnchorElement;
    expect(title.textContent.trim()).toBe('My YC app: Dropbox');
    expect(title.href).toBe('http://www.getdropbox.com/u/2/screencast.html');
    expect(title.getAttribute('target')).toBeNull();
    expect(el.querySelector('.domain').textContent).toBe('(getdropbox.com)');

    const subtext = el.querySelector('.subtext-laptop');
    expect(subtext.textContent).toContain('111 points by');
    expect(subtext.textContent).toContain('14 years ago');
    expect(subtext.textContent).toContain('71 comments');
    expect(subtext.querySelector('a[href="/user/dhouston"]')).not.toBeNull();
    expect(subtext.querySelector('a[href="/item/8863"]')).not.toBeNull();
  });

  it('links internal (Ask HN) stories to the item details page', () => {
    const el = render(makeStory({ url: 'item?id=8863', domain: undefined }));

    expect(component.hasUrl).toBe(false);
    expect(el.querySelector('a.title').getAttribute('href')).toBe('/item/8863');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('applies title font size and list spacing settings', () => {
    settings.titleFontSize = '20';
    settings.listSpacing = '12';
    const el = render(makeStory());

    expect((el.querySelector('a.title') as HTMLElement).style.fontSize).toBe('20px');
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('12px');
  });

  it('opens external links in a new tab when enabled', () => {
    settings.openLinkInNewTab = true;
    const el = render(makeStory());

    const title = el.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('hides user, points and comments for jobs', () => {
    const el = render(makeStory({ type: 'job', comments_count: 0 }));

    expect(el.querySelector('.subtext-laptop').textContent).not.toContain('points by');
    expect(el.querySelector('a[href="/user/dhouston"]')).toBeNull();
    expect(el.querySelector('a[href="/item/8863"]')).toBeNull();
  });
});
