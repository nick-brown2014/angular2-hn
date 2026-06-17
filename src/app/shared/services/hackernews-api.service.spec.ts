import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

describe('HackerNewsAPIService', () => {
    let service: HackerNewsAPIService;
    let mockXHR: any;
    let xhrRequests: any[];

    beforeEach(() => {
        service = new HackerNewsAPIService();
        xhrRequests = [];

        mockXHR = {
            open: jasmine.createSpy('open'),
            send: jasmine.createSpy('send'),
            setRequestHeader: jasmine.createSpy('setRequestHeader'),
            status: 200,
            responseURL: '',
            statusText: 'OK',
            responseText: '',
            response: '',
            withCredentials: false,
            onload: null as any,
            onerror: null as any,
            getAllResponseHeaders: jasmine.createSpy('getAllResponseHeaders').and.returnValue(''),
        };

        spyOn(window, 'XMLHttpRequest').and.callFake(() => {
            xhrRequests.push(mockXHR);
            return mockXHR;
        });
    });

    function respondWith(data: any) {
        mockXHR.responseText = JSON.stringify(data);
        mockXHR.onload();
    }

    it('fetchFeed should call correct URL and return Observable<Story[]>', (done) => {
        const mockStories: Story[] = [
            { id: 1, title: 'Test', points: 10, user: 'u', time: 0, time_ago: 0, type: 'story', url: '', domain: '', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false },
        ];

        service.fetchFeed('news', 1).subscribe((stories) => {
            expect(stories).toEqual(mockStories);
            done();
        });

        expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/news?page=1', true);
        respondWith(mockStories);
    });

    it('fetchItemContent should call correct URL and return Observable<Story>', (done) => {
        const mockStory: Story = {
            id: 123, title: 'Test', points: 10, user: 'u', time: 0, time_ago: 0,
            type: 'story', url: 'http://example.com', domain: 'example.com',
            comments: [], comments_count: 0, poll: [], poll_votes_count: 0,
            deleted: false, dead: false,
        };

        service.fetchItemContent(123).subscribe((story) => {
            expect(story.id).toBe(123);
            done();
        });

        expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/item/123', true);
        respondWith(mockStory);
    });

    it('fetchItemContent with poll-type story should fetch poll options and sum votes', (done) => {
        const pollOptionA: PollResult = { points: 10, content: 'Option A' };
        const pollOptionB: PollResult = { points: 20, content: 'Option B' };
        const mockPollStory: any = {
            id: 200, title: 'Poll', points: 10, user: 'u', time: 0, time_ago: 0,
            type: 'poll', url: '', domain: '',
            comments: [], comments_count: 0,
            poll: [{}, {}], poll_votes_count: 0,
            deleted: false, dead: false,
        };

        // Spy on fetchPollContent to return synchronous observables
        // so poll votes are accumulated within the map callback
        const { of: rxOf } = require('rxjs');
        spyOn(service, 'fetchPollContent').and.callFake((id: number) => {
            if (id === 201) { return rxOf(pollOptionA); }
            if (id === 202) { return rxOf(pollOptionB); }
            return rxOf({ points: 0, content: '' });
        });

        service.fetchItemContent(200).subscribe((story) => {
            expect(story.type).toBe('poll');
            expect(story.poll_votes_count).toBe(30);
            expect(service.fetchPollContent).toHaveBeenCalledTimes(2);
            done();
        });

        expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/item/200', true);
        respondWith(mockPollStory);
    });

    it('fetchUser should call correct URL and return Observable<User>', (done) => {
        const mockUser: User = { id: 'testuser', crated_time: 0, created: '2020', karma: 100, avg: 0, about: '' };

        service.fetchUser('testuser').subscribe((user) => {
            expect(user).toEqual(mockUser);
            done();
        });

        expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/user/testuser', true);
        respondWith(mockUser);
    });

    it('fetchPollContent should call correct URL and return Observable<PollResult>', (done) => {
        const mockPoll: PollResult = { points: 42, content: 'Option A' };

        service.fetchPollContent(456).subscribe((poll) => {
            expect(poll).toEqual(mockPoll);
            done();
        });

        expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/item/456', true);
        respondWith(mockPoll);
    });

    it('should emit an error when fetch rejects', (done) => {
        service.fetchFeed('news', 1).subscribe(
            () => fail('should have errored'),
            (error) => {
                expect(error).toBeTruthy();
                done();
            }
        );

        mockXHR.onerror(new Error('Network error'));
    });
});
