import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let settings: Settings;

  const story = {
    id: 1,
    title: 'A story',
    points: 10,
    user: 'pg',
    time_ago: '1 hour ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments_count: 3,
  } as unknown as Story;

  beforeEach(async(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = { ...story };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('hasUrl is true for external http(s) links', () => {
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl is false for internal item links', () => {
    component.item.url = 'item?id=1';
    expect(component.hasUrl).toBe(false);
  });

  it('renders an external title link with the domain', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(link.getAttribute('href')).toBe('https://example.com/post');
    expect(link.textContent.trim()).toBe('A story');
    expect(fixture.nativeElement.querySelector('.domain').textContent).toBe('(example.com)');
  });

  it('opens links in a new tab when the setting is enabled', () => {
    settings.openLinkInNewTab = true;
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });
});
