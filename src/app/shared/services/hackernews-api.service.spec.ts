import { HackerNewsAPIService } from './hackernews-api.service';
import * as unfetch from 'unfetch';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    service = new HackerNewsAPIService();
    fetchSpy = spyOn(unfetch, 'default' as any).and.callFake((url: string) => {
      return Promise.resolve({
        ok: true,
        statusText: 'OK',
        status: 200,
        url: url,
        text: () => Promise.resolve(''),
        json: () => Promise.resolve([]),
        blob: () => Promise.resolve(new Blob()),
        clone: () => ({} as any),
        headers: { keys: () => [], entries: () => [], get: () => undefined, has: () => false }
      });
    });
  });

  it('should have baseUrl set to https://node-hnapi.herokuapp.com', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  it('fetchFeed() should call the correct URL and return an Observable of Story[]', (done) => {
    const mockStories = [{ id: 1, title: 'Test Story' }];
    fetchSpy.and.callFake((url: string) => {
      return Promise.resolve({
        ok: true, statusText: 'OK', status: 200, url: url,
        text: () => Promise.resolve(''),
        json: () => Promise.resolve(mockStories),
        blob: () => Promise.resolve(new Blob()),
        clone: () => ({} as any),
        headers: { keys: () => [], entries: () => [], get: () => undefined, has: () => false }
      });
    });

    service.fetchFeed('news', 2).subscribe(result => {
      expect(result).toEqual(mockStories as any);
      expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2', undefined);
      done();
    });
  });

  it('fetchItemContent() should call the correct URL and return an Observable of Story', (done) => {
    const mockStory = { id: 123, title: 'Item', type: 'story', url: 'http://test.com' };
    fetchSpy.and.callFake((url: string) => {
      return Promise.resolve({
        ok: true, statusText: 'OK', status: 200, url: url,
        text: () => Promise.resolve(''),
        json: () => Promise.resolve(mockStory),
        blob: () => Promise.resolve(new Blob()),
        clone: () => ({} as any),
        headers: { keys: () => [], entries: () => [], get: () => undefined, has: () => false }
      });
    });

    service.fetchItemContent(123).subscribe(result => {
      expect(result.id).toBe(123);
      expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/123', undefined);
      done();
    });
  });

  it('fetchUser() should call the correct URL and return an Observable of User', (done) => {
    const mockUser = { id: 'testuser', karma: 100 };
    fetchSpy.and.callFake((url: string) => {
      return Promise.resolve({
        ok: true, statusText: 'OK', status: 200, url: url,
        text: () => Promise.resolve(''),
        json: () => Promise.resolve(mockUser),
        blob: () => Promise.resolve(new Blob()),
        clone: () => ({} as any),
        headers: { keys: () => [], entries: () => [], get: () => undefined, has: () => false }
      });
    });

    service.fetchUser('testuser').subscribe(result => {
      expect(result).toEqual(mockUser as any);
      expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/testuser', undefined);
      done();
    });
  });
});
