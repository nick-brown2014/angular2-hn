import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settings: Settings;

  function createStory(url: string): Story {
    return {
      id: 1,
      title: 'A story',
      points: 10,
      user: 'pg',
      time: 0,
      time_ago: '1 hour ago',
      type: 'story',
      url,
      domain: 'example.com',
      comments: [],
      comments_count: 3,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    } as any;
  }

  beforeEach(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      imports: [CommonModule, PipesModule],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('creates and reads the settings from the service', () => {
    component.item = createStory('https://example.com/a');
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('hasUrl is true for external http urls', () => {
    component.item = createStory('http://example.com/a');
    expect(component.hasUrl).toBe(true);

    component.item = createStory('https://example.com/a');
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl is false for internal item urls', () => {
    component.item = createStory('item?id=1');

    expect(component.hasUrl).toBe(false);
  });

  it('renders the story title as an external link when it has a url', () => {
    component.item = createStory('https://example.com/a');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a.title');
    expect(link.getAttribute('href')).toBe('https://example.com/a');
    expect(link.textContent).toContain('A story');
  });
});
