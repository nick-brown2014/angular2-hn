import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  const settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 1,
      title: 'A story',
      url: 'https://example.com/story',
      domain: 'example.com',
      user: 'pg',
      points: 10,
      comments_count: 3,
      time_ago: '1 hour ago',
      type: 'news'
    } as any;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should expose the settings from the settings service', () => {
    expect(component.settings).toBe(settings as any);
  });

  it('should render the item title', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.title').textContent).toContain('A story');
  });

  describe('hasUrl', () => {
    it('should be true for an external http url', () => {
      component.item.url = 'http://example.com/story';
      expect(component.hasUrl).toBe(true);
    });

    it('should be true for an external https url', () => {
      component.item.url = 'https://example.com/story';
      expect(component.hasUrl).toBe(true);
    });

    it('should be false for an internal hacker news url', () => {
      component.item.url = 'item?id=1';
      expect(component.hasUrl).toBe(false);
    });
  });
});
