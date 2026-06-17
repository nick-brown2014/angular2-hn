import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('ItemComponent', () => {
    let mockSettingsService: any;

    beforeEach(async(() => {
        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
        };

        TestBed.configureTestingModule({
            declarations: [ItemComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(ItemComponent);
        fixture.componentInstance.item = {
            id: 1, title: 'Test', points: 0, user: '', time: 0, time_ago: 0,
            type: 'story', url: '', domain: '', comments: [], comments_count: 0,
            poll: [], poll_votes_count: 0, deleted: false, dead: false,
        };
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should assign settings from service', () => {
        const fixture = TestBed.createComponent(ItemComponent);
        expect(fixture.componentInstance.settings).toBe(mockSettingsService.settings);
    });

    it('hasUrl should return true when item.url starts with http', () => {
        const fixture = TestBed.createComponent(ItemComponent);
        fixture.componentInstance.item = {
            id: 1, title: 'Test', points: 0, user: '', time: 0, time_ago: 0,
            type: 'story', url: 'http://example.com', domain: 'example.com',
            comments: [], comments_count: 0, poll: [], poll_votes_count: 0,
            deleted: false, dead: false,
        };
        expect(fixture.componentInstance.hasUrl).toBe(true);
    });

    it('hasUrl should return false for relative or empty URLs', () => {
        const fixture = TestBed.createComponent(ItemComponent);
        fixture.componentInstance.item = {
            id: 1, title: 'Test', points: 0, user: '', time: 0, time_ago: 0,
            type: 'story', url: 'item?id=123', domain: '',
            comments: [], comments_count: 0, poll: [], poll_votes_count: 0,
            deleted: false, dead: false,
        };
        expect(fixture.componentInstance.hasUrl).toBe(false);
    });
});
