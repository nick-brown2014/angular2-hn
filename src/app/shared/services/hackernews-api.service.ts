import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import fetch from 'unfetch';
import {map } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

interface AlgoliaHit {
  objectID: string;
  title: string | null;
  story_title?: string | null;
  url: string | null;
  author: string;
  points: number | null;
  num_comments: number | null;
  created_at_i: number;
}

interface AlgoliaSearchResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  nbPages: number;
  page: number;
  hitsPerPage: number;
}

export interface SearchResult {
  items: Story[];
  nbHits: number;
  nbPages: number;
}

export const SEARCH_PAGE_SIZE = 30;

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;
  searchBaseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
    this.searchBaseUrl = 'https://hn.algolia.com/api/v1';
  }

  search(query: string, page: number): Observable<SearchResult> {
    const q = encodeURIComponent(query.trim());
    const url = `${this.searchBaseUrl}/search?query=${q}&page=${page - 1}&tags=story&hitsPerPage=${SEARCH_PAGE_SIZE}`;
    return lazyFetch<AlgoliaSearchResponse>(url).pipe(map(res => ({
      items: (res.hits || []).map(toStory),
      nbHits: res.nbHits || 0,
      nbPages: res.nbPages || 0
    })));
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return lazyFetch(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return lazyFetch(`${this.baseUrl}/item/${id}`).pipe(map((story: Story) => {
      if (story.type === 'poll') {
        let numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
          this.fetchPollContent(story.id + i).subscribe(pollResults => {
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
          });
        }
      }
      return story;
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return lazyFetch(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return lazyFetch(`${this.baseUrl}/user/${id}`);
  }
}

function toStory(hit: AlgoliaHit): Story {
  const story = new Story();
  story.id = Number(hit.objectID);
  story.title = hit.title || hit.story_title || '';
  story.points = hit.points || 0;
  story.user = hit.author;
  story.time = hit.created_at_i;
  story.time_ago = timeAgo(hit.created_at_i);
  story.type = 'story';
  story.url = hit.url || '';
  story.domain = domainOf(story.url);
  story.comments = [];
  story.comments_count = hit.num_comments || 0;
  story.deleted = false;
  story.dead = false;
  return story;
}

function domainOf(url: string): string {
  if (!url) { return undefined; }
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return undefined;
  }
}

function timeAgo(unixSeconds: number): string {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];
  for (const [name, size] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) {
      return `${count} ${name}${count === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}

function lazyFetch<T>(url, options?) {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}

