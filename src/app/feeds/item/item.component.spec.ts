import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../shared/services/settings.service';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let settingsServiceStub: { settings: Settings };

  function makeStory(overrides: Partial<Story> = {}): Story {
    return {
      id: 1,
      title: 'Sample Story',
      points: 42,
      user: 'alice',
      time: 0,
      time_ago: 0,
      type: 'story',
      url: 'https://example.com/story',
      domain: 'example.com',
      comments: [],
      comments_count: 3,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false,
      ...overrides
    } as Story;
  }

  beforeEach(async () => {
    settingsServiceStub = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ItemComponent],
      imports: [RouterTestingModule, PipesModule],
      providers: [{ provide: SettingsService, useValue: settingsServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    component.item = makeStory();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('hasUrl should return true when item.url starts with "http"', () => {
    component.item = makeStory({ url: 'http://example.com' });
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return true when item.url starts with "https"', () => {
    component.item = makeStory({ url: 'https://example.com' });
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return false when item.url is empty', () => {
    component.item = makeStory({ url: '' });
    expect(component.hasUrl).toBe(false);
  });

  it('hasUrl should return false when item.url is a relative path', () => {
    component.item = makeStory({ url: 'item?id=1' });
    expect(component.hasUrl).toBe(false);
  });

  it('should render the item title in the template', () => {
    component.item = makeStory({ title: 'Test Headline' });
    fixture.detectChanges();
    const titleAnchors = fixture.debugElement.queryAll(By.css('a.title'));
    expect(titleAnchors.length).toBeGreaterThan(0);
    const text = titleAnchors[0].nativeElement.textContent.trim();
    expect(text).toContain('Test Headline');
  });

  it('should show the domain when hasUrl is true and a domain exists', () => {
    component.item = makeStory({ url: 'https://example.com', domain: 'example.com' });
    fixture.detectChanges();
    const domainEl = fixture.debugElement.query(By.css('.domain'));
    expect(domainEl).toBeTruthy();
    expect(domainEl.nativeElement.textContent).toContain('example.com');
  });

  it('should link to item details (via routerLink) when hasUrl is false', () => {
    component.item = makeStory({ url: '', domain: '' });
    fixture.detectChanges();
    const titleAnchor = fixture.debugElement.query(By.css('a.title'));
    // No raw href attribute should be present — the link is wired via routerLink.
    expect(titleAnchor.nativeElement.getAttribute('href')).not.toBe('https://example.com/story');
    // The element should still resolve to a routerLink-driven path that targets the item.
    expect(titleAnchor.nativeElement.getAttribute('href')).toContain('/item/');
  });

  it('should show the user link for non-job items', () => {
    component.item = makeStory({ type: 'story', user: 'alice' });
    fixture.detectChanges();
    const userLinks = fixture.debugElement.queryAll(By.css('.name a, .subtext-laptop a'));
    const hasUserLink = userLinks.some(el => el.nativeElement.textContent.trim() === 'alice');
    expect(hasUserLink).toBe(true);
  });

  it('should hide points and user info for job items', () => {
    component.item = makeStory({ type: 'job' });
    fixture.detectChanges();
    const userNameEl = fixture.debugElement.query(By.css('.name'));
    expect(userNameEl).toBeFalsy();
  });
});
