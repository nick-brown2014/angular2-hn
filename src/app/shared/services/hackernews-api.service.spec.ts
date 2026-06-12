import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let mockXHR: any;

  beforeEach(() => {
    service = new HackerNewsAPIService();

    mockXHR = {
      open: jasmine.createSpy('open'),
      send: jasmine.createSpy('send'),
      setRequestHeader: jasmine.createSpy('setRequestHeader'),
      getAllResponseHeaders: jasmine.createSpy('getAllResponseHeaders').and.returnValue(''),
      responseText: '',
      status: 200,
      onload: null as any,
      onerror: null as any,
      withCredentials: false
    };

    spyOn(window, 'XMLHttpRequest').and.returnValue(mockXHR);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have baseUrl set to https://node-hnapi.herokuapp.com', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  it('fetchFeed should call the correct URL and return Observable<Story[]>', (done) => {
    const mockStories: Story[] = [
      { id: 1, title: 'Test Story', points: 10, user: 'testuser', time: 123, time_ago: 1, type: 'link' as any, url: 'http://example.com', domain: 'example.com', comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false }
    ];

    mockXHR.responseText = JSON.stringify(mockStories);

    service.fetchFeed('news', 1).subscribe(stories => {
      expect(stories).toEqual(mockStories);
      expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/news?page=1', true);
      done();
    });

    mockXHR.onload();
  });

  it('fetchItemContent should call correct URL', (done) => {
    const mockStory: Story = { id: 123, title: 'Test', points: 10, user: 'user', time: 123, time_ago: 1, type: 'link' as any, url: 'http://example.com', domain: 'example.com', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false };

    mockXHR.responseText = JSON.stringify(mockStory);

    service.fetchItemContent(123).subscribe(story => {
      expect(story.id).toBe(123);
      expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/item/123', true);
      done();
    });

    mockXHR.onload();
  });

  it('fetchUser should call correct URL and return Observable<User>', (done) => {
    const mockUser: User = { id: 'testuser', crated_time: 123, created: '2020-01-01', karma: 100, avg: 5, about: 'test' };

    mockXHR.responseText = JSON.stringify(mockUser);

    service.fetchUser('testuser').subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(mockXHR.open).toHaveBeenCalledWith('get', 'https://node-hnapi.herokuapp.com/user/testuser', true);
      done();
    });

    mockXHR.onload();
  });

  it('should emit error when fetch rejects', (done) => {
    service.fetchFeed('news', 1).subscribe(
      () => fail('should have errored'),
      (error) => {
        expect(error).toBeTruthy();
        done();
      }
    );

    mockXHR.onerror('Network error');
  });
});
