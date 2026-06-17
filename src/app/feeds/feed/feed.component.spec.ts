import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ActivatedRoute } from '@angular/router';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
    let mockHNService: any;
    let dataSubject: BehaviorSubject<any>;
    let paramsSubject: BehaviorSubject<any>;
    let mockStories: Story[];

    beforeEach(async(() => {
        mockStories = [
            {
                id: 1, title: 'Test Story', points: 10, user: 'testuser', time: 0,
                time_ago: 0, type: 'story', url: 'http://example.com', domain: 'example.com',
                comments: [], comments_count: 5, poll: [], poll_votes_count: 0,
                deleted: false, dead: false,
            },
        ];

        mockHNService = {
            fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(mockStories)),
        };

        dataSubject = new BehaviorSubject({ feedType: 'news' });
        paramsSubject = new BehaviorSubject({ page: '1' });

        TestBed.configureTestingModule({
            declarations: [FeedComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: dataSubject.asObservable(),
                        params: paramsSubject.asObservable(),
                    },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(FeedComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should subscribe to route data for feedType on init', () => {
        const fixture = TestBed.createComponent(FeedComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.feedType).toBe('news');
    });

    it('should subscribe to route params for page number and call fetchFeed', () => {
        const fixture = TestBed.createComponent(FeedComponent);
        fixture.detectChanges();
        expect(mockHNService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should set items from API response', () => {
        const fixture = TestBed.createComponent(FeedComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.items).toEqual(mockStories);
    });

    it('should set listStart correctly: ((pageNum - 1) * 30) + 1', () => {
        const fixture = TestBed.createComponent(FeedComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.listStart).toBe(1);

        paramsSubject.next({ page: '3' });
        fixture.detectChanges();
        expect(fixture.componentInstance.listStart).toBe(61);
    });

    it('should set errorMessage on API error', () => {
        mockHNService.fetchFeed.and.returnValue(throwError('error'));
        const fixture = TestBed.createComponent(FeedComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.errorMessage).toContain('Could not load');
    });
});
