import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  standalone: false,
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {
  typeSub!: Subscription;
  pageSub!: Subscription;
  items!: Story[];
  feedType = '';
  pageNum = 1;
  listStart = 1;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = data['feedType'];
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe({
          next: items => this.items = items,
          error: () => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          complete: () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            this.viewportScroller.scrollToPosition([0, 0]);
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.typeSub.unsubscribe();
    this.pageSub.unsubscribe();
  }

  trackById(_index: number, item: Story): number {
    return item.id;
  }
}
