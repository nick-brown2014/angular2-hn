import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settings: Settings;

  beforeEach(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: true,
      theme: 'default',
      titleFontSize: '18',
      listSpacing: '4'
    };

    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      imports: [PipesModule],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 7,
      title: 'A story',
      url: 'https://example.com/a-story',
      domain: 'example.com',
      type: 'story',
      user: 'pg',
      points: 12,
      comments_count: 3
    } as Story;
  });

  it('creates the component and exposes the shared settings', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('treats an absolute link as an external url', () => {
    expect(component.hasUrl).toBe(true);
  });

  it('treats an internal item path as having no url', () => {
    component.item.url = 'item?id=7';

    expect(component.hasUrl).toBe(false);
  });

  it('renders the title as an external link when the story has a url', () => {
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');

    expect(link.getAttribute('href')).toBe('https://example.com/a-story');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.textContent.trim()).toBe('A story');
  });
});
