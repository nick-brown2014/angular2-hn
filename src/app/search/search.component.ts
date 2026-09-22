import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';

import { HackerNewsAPIService, SEARCH_PAGE_SIZE } from '../shared/services/hackernews-api.service';
import { Story } from '../shared/models/story';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  fetchSub: Subscription;

  query = '';
  activeQuery = '';
  pageNum = 1;
  items: Story[];
  totalHits = 0;
  totalPages = 0;
  listStart = 1;
  errorMessage = '';

  constructor(
    private hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.routeSub = combineLatest([this.route.params, this.route.queryParamMap])
      .subscribe(([params, queryParams]) => {
        this.pageNum = params.page ? +params.page : 1;
        this.activeQuery = (queryParams.get('q') || '').trim();
        this.query = this.activeQuery;
        this.load();
      });
  }

  load() {
    this.errorMessage = '';
    this.items = undefined;
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }

    if (!this.activeQuery) {
      this.items = [];
      this.totalHits = 0;
      this.totalPages = 0;
      return;
    }

    this.fetchSub = this.hackerNewsAPIService.search(this.activeQuery, this.pageNum)
      .subscribe(
        result => {
          this.items = result.items;
          this.totalHits = result.nbHits;
          this.totalPages = result.nbPages;
        },
        () => this.errorMessage = `Could not search for "${this.activeQuery}".`,
        () => {
          this.listStart = ((this.pageNum - 1) * SEARCH_PAGE_SIZE) + 1;
          window.scrollTo(0, 0);
        }
      );
  }

  submit() {
    const q = this.query.trim();
    if (!q) {
      return;
    }
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  get hasMore(): boolean {
    return this.pageNum < this.totalPages;
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }
  }
}
