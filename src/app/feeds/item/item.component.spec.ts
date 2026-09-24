import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';
import { createMockSettingsService } from '../../../testing/mock-settings.service';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settingsService: ReturnType<typeof createMockSettingsService>;

  const story = {
    id: 123,
    title: 'Hello HN',
    points: 42,
    user: 'alice',
    time_ago: '2 hours ago',
    type: 'link',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments_count: 5
  } as any as Story;

  beforeEach(async () => {
    settingsService = createMockSettingsService();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = { ...story };
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('hasUrl is true for external links', () => {
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl is false for internal item links', () => {
    component.item.url = 'item?id=123';
    expect(component.hasUrl).toBe(false);
  });

  it('renders title, domain and comment count', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('a.title').textContent.trim()).toBe('Hello HN');
    expect(el.querySelector('a.title').getAttribute('href')).toBe('https://example.com/post');
    expect(el.querySelector('.domain').textContent).toBe('(example.com)');
    expect(el.querySelector('.comment-number').textContent).toContain('5 comments');
  });

  it('opens links in a new tab when enabled', () => {
    const link = () => fixture.nativeElement.querySelector('a.title');
    expect(link().getAttribute('target')).toBeNull();

    settingsService.settings.openLinkInNewTab = true;
    fixture.detectChanges();
    expect(link().getAttribute('target')).toBe('_blank');
    expect(link().getAttribute('rel')).toBe('noopener');
  });

  it('applies title font size and list spacing from settings', () => {
    settingsService.settings.titleFontSize = '22';
    settingsService.settings.listSpacing = '9';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect((el.querySelector('a.title') as HTMLElement).style.fontSize).toBe('22px');
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('9px');
  });

  it('hides points and comments for jobs', () => {
    component.item = { ...story, type: 'job' } as Story;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.name')).toBeNull();
    expect(fixture.nativeElement.querySelector('.comment-number')).toBeNull();
  });
});
