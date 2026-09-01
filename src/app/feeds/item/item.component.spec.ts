import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

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
      time_ago: '1 hour ago',
      comments_count: 3,
      type: 'link'
    } as unknown as Story;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the story title', () => {
    expect(fixture.nativeElement.querySelector('.title').textContent).toContain('A story');
  });

  it('hasUrl should be true for external stories and false for internal ones', () => {
    expect(component.hasUrl).toBe(true);

    component.item.url = 'item?id=1';

    expect(component.hasUrl).toBe(false);
  });
});
