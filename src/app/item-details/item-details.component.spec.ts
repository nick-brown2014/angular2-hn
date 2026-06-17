import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
    let mockHNService: any;
    let mockSettingsService: any;
    let mockLocation: any;
    let paramsSubject: Subject<any>;

    const mockStory: Story = {
        id: 123, title: 'Test', points: 10, user: 'u', time: 0, time_ago: 0,
        type: 'story', url: 'http://example.com', domain: 'example.com',
        comments: [], comments_count: 0, poll: [], poll_votes_count: 0,
        deleted: false, dead: false,
    };

    beforeEach(async(() => {
        paramsSubject = new Subject();

        mockHNService = {
            fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(mockStory)),
        };

        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
        };

        mockLocation = {
            back: jasmine.createSpy('back'),
        };

        TestBed.configureTestingModule({
            declarations: [ItemDetailsComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
                { provide: Location, useValue: mockLocation },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(ItemDetailsComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should subscribe to route params and call fetchItemContent on init', () => {
        spyOn(window, 'scrollTo');
        const fixture = TestBed.createComponent(ItemDetailsComponent);
        fixture.detectChanges();

        paramsSubject.next({ id: '123' });
        expect(mockHNService.fetchItemContent).toHaveBeenCalledWith(123);
    });

    it('should set item from API response', () => {
        spyOn(window, 'scrollTo');
        const fixture = TestBed.createComponent(ItemDetailsComponent);
        fixture.detectChanges();

        paramsSubject.next({ id: '123' });
        expect(fixture.componentInstance.item).toEqual(mockStory);
    });

    it('should set errorMessage on API error', () => {
        spyOn(window, 'scrollTo');
        mockHNService.fetchItemContent.and.returnValue(throwError('error'));
        const fixture = TestBed.createComponent(ItemDetailsComponent);
        fixture.detectChanges();

        paramsSubject.next({ id: '123' });
        expect(fixture.componentInstance.errorMessage).toBe('Could not load item comments.');
    });

    it('goBack should call _location.back()', () => {
        const fixture = TestBed.createComponent(ItemDetailsComponent);
        fixture.componentInstance.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('hasUrl should return correct boolean', () => {
        const fixture = TestBed.createComponent(ItemDetailsComponent);
        fixture.componentInstance.item = { ...mockStory, url: 'http://example.com' };
        expect(fixture.componentInstance.hasUrl).toBe(true);

        fixture.componentInstance.item = { ...mockStory, url: 'item?id=123' };
        expect(fixture.componentInstance.hasUrl).toBe(false);
    });
});
