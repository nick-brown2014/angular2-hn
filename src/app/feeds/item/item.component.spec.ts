import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  const settings = {
    showSettings: false,
    openLinkInNewTab: true,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '4'
  };

  function storyFixture(overrides: Partial<Story> = {}): Story {
    return Object.assign(
      {
        id: 1,
        title: 'A linked story',
        url: 'https://example.com/post',
        domain: 'example.com',
        user: 'pg',
        points: 42,
        time_ago: '2 hours ago',
        type: 'story',
        comments_count: 3
      },
      overrides
    ) as Story;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: { settings } }]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('is created with the settings from the settings service', () => {
    component.item = storyFixture();

    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings as any);
  });

  it('treats an http url as an external link', () => {
    component.item = storyFixture();

    expect(component.hasUrl).toBe(true);
  });

  it('treats an internal hn url as not linkable', () => {
    component.item = storyFixture({ url: 'item?id=1' });

    expect(component.hasUrl).toBe(false);
  });

  it('renders the story title as an external link when it has a url', () => {
    component.item = storyFixture();

    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(link.getAttribute('href')).toBe('https://example.com/post');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.textContent.trim()).toBe('A linked story');
    expect(fixture.nativeElement.querySelector('.domain').textContent).toContain('example.com');
  });

  it('renders the comment count through the comment pipe', () => {
    component.item = storyFixture({ comments_count: 1 });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.comment-number').textContent).toContain('1 comment');
  });

  it('hides the author details for job postings', () => {
    component.item = storyFixture({ type: 'job' });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.details .name')).toBeNull();
  });
});
