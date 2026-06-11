import { HackerNewsAPIService } from './hackernews-api.service';
import * as unfetchModule from 'unfetch';
import { Story } from '../models/story';
import { PollResult } from '../models/poll-result';

function mockResponse(data: any): Promise<any> {
  return Promise.resolve({ json: () => Promise.resolve(data) });
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    service = new HackerNewsAPIService();
    fetchSpy = spyOn(unfetchModule, 'default').and.callFake((url: string) => {
      return mockResponse({});
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set baseUrl to node-hnapi', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  describe('fetchFeed', () => {
    it('should call the correct URL with feedType and page', (done: DoneFn) => {
      const mockStories: Story[] = [
        { id: 1, title: 'Test', points: 10, user: 'user1', time: 0, time_ago: 0, type: 'story', url: 'http://test.com', domain: 'test.com', comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false }
      ];
      fetchSpy.and.returnValue(mockResponse(mockStories));

      service.fetchFeed('news', 1).subscribe(items => {
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1', undefined);
        expect(items).toEqual(mockStories);
        done();
      });
    });

    it('should call the correct URL for different feed types and pages', (done: DoneFn) => {
      fetchSpy.and.returnValue(mockResponse([]));

      service.fetchFeed('newest', 3).subscribe(() => {
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/newest?page=3', undefined);
        done();
      });
    });

    it('should return an Observable of Story[]', (done: DoneFn) => {
      const mockStories: Story[] = [
        { id: 1, title: 'A', points: 1, user: 'u', time: 0, time_ago: 0, type: 'story', url: '', domain: '', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false },
        { id: 2, title: 'B', points: 2, user: 'v', time: 0, time_ago: 0, type: 'story', url: '', domain: '', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false }
      ];
      fetchSpy.and.returnValue(mockResponse(mockStories));

      service.fetchFeed('show', 1).subscribe(items => {
        expect(items.length).toBe(2);
        expect(items[0].title).toBe('A');
        expect(items[1].title).toBe('B');
        done();
      });
    });
  });

  describe('fetchItemContent', () => {
    it('should call /item/{id} URL', (done: DoneFn) => {
      const mockStory: Story = { id: 123, title: 'Test', points: 10, user: 'user1', time: 0, time_ago: 0, type: 'story', url: 'http://test.com', domain: 'test.com', comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false };
      fetchSpy.and.returnValue(mockResponse(mockStory));

      service.fetchItemContent(123).subscribe(item => {
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/123', undefined);
        expect(item.id).toBe(123);
        done();
      });
    });

    it('should return Observable<Story>', (done: DoneFn) => {
      const mockStory: Story = { id: 456, title: 'Story', points: 20, user: 'u', time: 0, time_ago: 0, type: 'story', url: '', domain: '', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false };
      fetchSpy.and.returnValue(mockResponse(mockStory));

      service.fetchItemContent(456).subscribe(item => {
        expect(item).toEqual(mockStory);
        done();
      });
    });

    it('should handle poll type by fetching sub-items and aggregating poll_votes_count', (done: DoneFn) => {
      const pollResult1: PollResult = { points: 10, content: 'Option A' };
      const pollResult2: PollResult = { points: 20, content: 'Option B' };
      const mockPollStory: any = {
        id: 100, title: 'Poll', points: 30, user: 'u', time: 0, time_ago: 0,
        type: 'poll', url: '', domain: '', comments: [], comments_count: 0,
        poll: [{}, {}], poll_votes_count: 0, deleted: false, dead: false
      };

      let callCount = 0;
      fetchSpy.and.callFake((url: string) => {
        callCount++;
        if (url.includes('/item/100')) {
          return mockResponse(mockPollStory);
        } else if (url.includes('/item/101')) {
          return mockResponse(pollResult1);
        } else if (url.includes('/item/102')) {
          return mockResponse(pollResult2);
        }
        return mockResponse({});
      });

      service.fetchItemContent(100).subscribe(story => {
        expect(story.type).toBe('poll');
        // poll sub-items are fetched asynchronously; verify the calls were made
        setTimeout(() => {
          expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/101', undefined);
          expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/102', undefined);
          expect(story.poll_votes_count).toBe(30);
          expect(story.poll[0]).toEqual(pollResult1);
          expect(story.poll[1]).toEqual(pollResult2);
          done();
        }, 100);
      });
    });
  });

  describe('fetchPollContent', () => {
    it('should call /item/{id} URL', (done: DoneFn) => {
      const mockPoll: PollResult = { points: 15, content: 'Option' };
      fetchSpy.and.returnValue(mockResponse(mockPoll));

      service.fetchPollContent(200).subscribe(result => {
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/200', undefined);
        expect(result).toEqual(mockPoll);
        done();
      });
    });
  });

  describe('fetchUser', () => {
    it('should call /user/{id} URL', (done: DoneFn) => {
      const mockUser = { id: 'testuser', crated_time: 0, created: '10 years ago', karma: 500, avg: 0, about: 'Hello' };
      fetchSpy.and.returnValue(mockResponse(mockUser));

      service.fetchUser('testuser').subscribe(user => {
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/testuser', undefined);
        expect(user.id).toBe('testuser');
        expect(user.karma).toBe(500);
        done();
      });
    });
  });

  describe('error handling', () => {
    it('should emit an error when fetch rejects', (done: DoneFn) => {
      fetchSpy.and.returnValue(Promise.reject(new Error('Network error')));

      service.fetchFeed('news', 1).subscribe(
        () => fail('Should not emit a value'),
        (error: Error) => {
          expect(error.message).toBe('Network error');
          done();
        }
      );
    });

    it('should emit an error for fetchItemContent when fetch rejects', (done: DoneFn) => {
      fetchSpy.and.returnValue(Promise.reject(new Error('Fetch failed')));

      service.fetchItemContent(999).subscribe(
        () => fail('Should not emit a value'),
        (error: Error) => {
          expect(error.message).toBe('Fetch failed');
          done();
        }
      );
    });

    it('should emit an error for fetchUser when fetch rejects', (done: DoneFn) => {
      fetchSpy.and.returnValue(Promise.reject(new Error('User not found')));

      service.fetchUser('nonexistent').subscribe(
        () => fail('Should not emit a value'),
        (error: Error) => {
          expect(error.message).toBe('User not found');
          done();
        }
      );
    });
  });
});
