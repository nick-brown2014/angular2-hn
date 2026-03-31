import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

@Injectable({
  providedIn: 'root'
})
export class HackerNewsAPIService {
  private baseUrl = 'https://node-hnapi.herokuapp.com';

  constructor(private http: HttpClient) {}

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return this.http.get<Story>(`${this.baseUrl}/item/${id}`).pipe(
      switchMap((story: Story) => {
        if (story.type === 'poll' && story.poll && story.poll.length > 0) {
          const numberOfPollOptions = story.poll.length;
          const pollRequests: Observable<PollResult>[] = [];
          for (let i = 1; i <= numberOfPollOptions; i++) {
            pollRequests.push(this.fetchPollContent(story.id + i));
          }
          return forkJoin(pollRequests).pipe(
            map((pollResults: PollResult[]) => {
              story.poll = pollResults;
              story.poll_votes_count = pollResults.reduce((sum, pr) => sum + pr.points, 0);
              return story;
            })
          );
        }
        return new Observable<Story>(observer => {
          observer.next(story);
          observer.complete();
        });
      })
    );
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return this.http.get<PollResult>(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/${id}`);
  }
}

