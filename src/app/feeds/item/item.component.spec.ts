import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  const settingsStub = {
    settings: { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' },
  };
  const baseItem = {
    id: 1,
    title: 'Hello',
    points: 10,
    user: 'pg',
    time_ago: '1 hour ago',
    comments_count: 3,
    domain: 'example.com',
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: settingsStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('should create and expose settings from the service', () => {
    component.item = { ...baseItem, url: 'https://example.com' } as Story;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsStub.settings);
  });

  it('hasUrl returns true when item.url starts with http', () => {
    component.item = { ...baseItem, url: 'https://example.com/post' } as Story;
    expect(component.hasUrl).toBe(true);
    component.item = { ...baseItem, url: 'http://example.com/post' } as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl returns false when item.url is an internal link', () => {
    component.item = { ...baseItem, url: 'item?id=1' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
