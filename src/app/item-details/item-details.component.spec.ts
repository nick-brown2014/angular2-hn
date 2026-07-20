import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let apiSpy: jasmine.SpyObj<HackerNewsAPIService>;
  const settingsStub = { settings: { openLinkInNewTab: false, theme: 'default' } };

  function createComponent(params: any, itemResult: any): ItemDetailsComponent {
    apiSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    apiSpy.fetchItemContent.and.returnValue(itemResult);

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiSpy },
        { provide: SettingsService, useValue: settingsStub },
        { provide: ActivatedRoute, useValue: { params: of(params) } },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) }
      ]
    });
    TestBed.overrideTemplate(ItemDetailsComponent, '');

    const fixture = TestBed.createComponent(ItemDetailsComponent);
    fixture.detectChanges(); // triggers ngOnInit
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('hasUrl getter', () => {
    it('should be true when item.url starts with http', () => {
      const component = createComponent({ id: '1' }, of({ url: 'http://example.com' } as Story));
      component.item = { url: 'https://example.com' } as Story;
      expect(component.hasUrl).toBe(true);
    });

    it('should be false when item.url does not start with http', () => {
      const component = createComponent({ id: '1' }, of({ url: 'http://example.com' } as Story));
      component.item = { url: '/item/1' } as Story;
      expect(component.hasUrl).toBe(false);
    });
  });

  it('should fetch the item using the id route param and set item on success', () => {
    const story = { id: 42, title: 'Answer', url: 'http://a.com' } as Story;
    const component = createComponent({ id: '42' }, of(story));
    expect(apiSpy.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item).toEqual(story);
  });

  it('should set errorMessage when the item fetch fails', () => {
    const component = createComponent({ id: '42' }, throwError('boom'));
    expect(component.errorMessage).toBe('Could not load item comments.');
  });
});
