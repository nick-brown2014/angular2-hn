import { TestBed } from '@angular/core/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: { settings: { openLinkInNewTab: false } } }]
    });
    TestBed.overrideTemplate(ItemComponent, '');
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = TestBed.createComponent(ItemComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hasUrl should reflect whether the item url starts with http', () => {
    const component = TestBed.createComponent(ItemComponent).componentInstance;
    component.item = { url: 'http://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
    component.item = { url: '/item/1' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
