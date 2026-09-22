# Full-Text Search Feature Specification

**Status:** Draft — for review, not yet implemented
**Scope:** `nick-brown2014/angular2-hn` (Angular 9 Hacker News PWA)

---

## 1. Overview / Motivation

The application currently has **no search capability anywhere**. Users can browse the
five fixed feeds (`news`, `newest`, `show`, `ask`, `jobs`), open an item's comment thread
(`/item/:id`), or view a user profile (`/user/:id`), but there is no way to find a story
by keyword, title, or URL.

The goal of this feature is to add Hacker News full-text search so a user can:

1. Open a dedicated search page from the header.
2. Enter a query and receive a paginated list of matching stories.
3. Interact with each result exactly as they do with feed stories (open the link, open
   the comment thread, open the author profile).

The feature is backed by the public **Hacker News Algolia API**, which already indexes
all HN content and requires no authentication. The existing data source
(`https://node-hnapi.herokuapp.com`, see `HackerNewsAPIService.baseUrl`) does not expose
a search endpoint, so search is the only call in the app that talks to a second host.

---

## 2. Proposed API

### 2.1 New service method

Add a single method to `HackerNewsAPIService`
(`src/app/shared/services/hackernews-api.service.ts`):

```ts
search(query: string, page: number): Observable<Story[]>
```

- `query` — the raw user-entered string. It **must** be URL-encoded with
  `encodeURIComponent` before being interpolated into the URL.
- `page` — 1-based, to match the rest of the app (`/news/1`, `listStart` math in
  `FeedComponent`). Algolia pages are **0-based**, so the service sends `page - 1`.
- Returns `Observable<Story[]>` so the consumer looks identical to `fetchFeed`.

### 2.2 Endpoint

```
https://hn.algolia.com/api/v1/search?query=<query>&page=<page>&tags=story
```

- `tags=story` restricts results to stories (excludes comments, polls, etc.), so every
  hit can be rendered by `ItemComponent` without special-casing.
- The Algolia default page size is 20 hits. To keep pagination logic consistent with the
  feeds (which assume 30 per page for `listStart` and the "More" link), the request
  should also pass `hitsPerPage=30`. See Open Questions if a different page size is
  preferred.

### 2.3 Reusing `lazyFetch`

`lazyFetch<T>(url, options?)` is a module-private function in the service file that wraps
`unfetch` in a cancellable `Observable`. Search reuses it unchanged; the Algolia base URL
is held in a second field on the service so the two hosts are clearly distinguished:

```ts
// pseudo-diff, hackernews-api.service.ts
export class HackerNewsAPIService {
  baseUrl: string;
+ searchBaseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
+   this.searchBaseUrl = 'https://hn.algolia.com/api/v1';
  }

+ search(query: string, page: number): Observable<Story[]> {
+   const q = encodeURIComponent(query.trim());
+   const url = `${this.searchBaseUrl}/search?query=${q}&page=${page - 1}&tags=story&hitsPerPage=30`;
+   return lazyFetch<AlgoliaSearchResponse>(url).pipe(
+     map(res => res.hits.map(toStory))
+   );
+ }
}
```

`toStory` is a small pure mapping function (private to the service file, next to
`lazyFetch`) implementing the table below. `AlgoliaSearchResponse` / `AlgoliaHit` are
local interfaces (not exported models) describing only the fields we read.

### 2.4 Field mapping: Algolia `hit` → `Story`

The existing `Story` model (`src/app/shared/models/story.ts`) is populated by the
node-hnapi shape. Algolia uses different names, so each hit is mapped as follows:

| `Story` field        | Algolia `hit` field       | Notes |
|----------------------|---------------------------|-------|
| `id`                 | `objectID`                | Algolia returns a **string**; convert with `+hit.objectID` / `Number(...)`. Used by `ItemComponent` for `['/item', item.id]`. |
| `title`              | `title`                   | May be `null` for some hits; fall back to `story_title` then `''`. |
| `points`             | `points`                  | May be `null`; default `0`. |
| `user`               | `author`                  | Used for `['/user', item.user]`. |
| `time`               | `created_at_i`            | Unix seconds — same unit node-hnapi uses. |
| `time_ago`           | *(derived)*               | Not provided by Algolia. Compute a relative string (e.g. `"3 hours ago"`) from `created_at_i`. See Open Questions re: where this helper lives. |
| `type`               | *(constant)* `'story'`    | All hits are stories because of `tags=story`. `FeedType` is `'poll' \| 'story' \| 'job'` (`feed-type.type.ts`); `ItemComponent` only branches on `type !== 'job'`. |
| `url`                | `url`                     | May be `null` for Ask HN / text posts. `ItemComponent.hasUrl` calls `item.url.indexOf(...)`, which throws on `null` — **the mapper must default `url` to `''`** so the "no URL → link to `/item/:id`" branch is taken. |
| `domain`             | *(derived from `url`)*    | node-hnapi returns a bare hostname (e.g. `github.com`). Derive with `new URL(url).hostname` (strip a leading `www.`), or leave `undefined` when there is no URL; the template already guards with `*ngIf="item.domain"`. |
| `comments_count`     | `num_comments`            | May be `null`; default `0`. Feeds the `comment` pipe. |
| `comments`           | *(not set)* `[]`          | Search results are list items only; the comment thread is loaded by `/item/:id`. |
| `poll`, `poll_votes_count` | *(not set)*         | Polls are excluded by `tags=story`. |
| `deleted`, `dead`    | *(not set)* `false`       | Algolia does not return deleted/dead items in search. |

Other response fields of interest (not mapped onto `Story`, but read by the component or
useful for pagination):

| Algolia response field | Use |
|------------------------|-----|
| `nbHits`               | Total matches; can drive an "N results" label and the empty-results state. |
| `nbPages`              | Total pages; lets the component hide "More ›" on the last page instead of relying on `items.length === 30`. |
| `page`                 | Echo of the requested 0-based page. |
| `hitsPerPage`          | Echo of the requested page size. |

### 2.5 Error behaviour

`lazyFetch` only errors on a network failure (`fetch` rejection) — it does **not** inspect
`res.ok`. Algolia returns HTTP 4xx for malformed requests with a JSON body lacking `hits`;
`toStory` mapping over `undefined` would throw inside `map`, which RxJS surfaces as an
error to the subscriber. That is acceptable for v1 (the component shows its error state),
but the implementer may optionally guard with `res.hits || []`.

---

## 3. Routing

Add one lazy-loaded route to `src/app/app.routes.ts`, mirroring the existing `item` and
`user` entries exactly:

```ts
// pseudo-diff, app.routes.ts
  {path: 'item', loadChildren: () => import('./item-details/item-details.module').then(m => m.ItemDetailsModule)},
  {path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
+ {path: 'search', loadChildren: () => import('./search/search.module').then(m => m.SearchModule)}
```

Inside `SearchModule`, child routes are registered with `RouterModule.forChild` (as in
`ItemDetailsModule` / `UserModule`):

```ts
const routes: Routes = [
  { path: '', component: SearchComponent },            // /search
  { path: ':page', component: SearchComponent }        // /search/2
];
```

URL shape:

```
/search?q=<term>          → page 1
/search/<page>?q=<term>   → page N (1-based, matching /news/<page>)
```

- The **query is a query-string parameter (`q`)**, not a path segment, so arbitrary
  characters (spaces, slashes, `?`) never break routing and the URL is shareable.
- The **page is a path segment**, matching how the feeds expose pagination
  (`/news/2`), so `routerLink` arrays like `['/search', pageNum + 1]` with
  `queryParamsHandling: 'preserve'` work naturally.
- Navigating to `/search` with no `q` renders the empty-query state (Section 4.4); it does
  **not** redirect.

---

## 4. New Feature Module & Component

### 4.1 Files

```
src/app/search/
├── search.module.ts
├── search.component.ts
├── search.component.html
└── search.component.scss
```

### 4.2 `search.module.ts`

```ts
@NgModule({
  imports: [
    CommonModule,
    FormsModule,                 // ngModel on the query input (already a dependency: @angular/forms)
    SharedComponentsModule,      // <app-loader>, <app-error-message>
    PipesModule,                 // `comment` pipe used inside ItemComponent's template
    RouterModule.forChild(routes)
  ],
  declarations: [SearchComponent],
  exports: [SearchComponent, RouterModule]
})
export class SearchModule {}
```

**Important dependency note:** `ItemComponent` (`<item>`) is currently declared directly
in `AppModule` (`src/app/app.module.ts`), not in a shared module. A lazy-loaded
`SearchModule` cannot use a component declared in `AppModule`. To reuse `ItemComponent`
the implementation must do **one** of:

- **(Recommended)** Move `ItemComponent` out of `AppModule` and into
  `SharedComponentsModule` (declare + export it there, and import `RouterModule` and
  `PipesModule` into `SharedComponentsModule` because the item template uses
  `routerLink` and the `comment` pipe). `AppModule` already imports
  `SharedComponentsModule`, so `FeedComponent` keeps working unchanged.
- Or create a tiny `ItemModule` under `src/app/feeds/item/` that declares/exports
  `ItemComponent`, imported by both `AppModule` and `SearchModule`.

Either way, this is the one change outside `src/app/search/` beyond the route and
service additions. See Open Questions.

### 4.3 `search.component.ts`

Follows the `FeedComponent` pattern (subscribe to the route, call the service, assign
`items`, set `errorMessage` on failure, scroll to top on completion):

```ts
export class SearchComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  fetchSub: Subscription;

  query = '';           // bound to the input via ngModel
  activeQuery = '';     // the query currently reflected in the URL / results
  pageNum = 1;
  items: Story[];       // undefined = loading (same convention as FeedComponent)
  totalHits: number;
  totalPages: number;
  listStart = 1;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // combineLatest(params, queryParamMap) so a change to either re-runs the search
    this.routeSub = combineLatest([this.route.params, this.route.queryParamMap])
      .subscribe(([params, qp]) => {
        this.pageNum = params['page'] ? +params['page'] : 1;
        this.activeQuery = (qp.get('q') || '').trim();
        this.query = this.activeQuery;
        this.load();
      });
  }

  load() {
    this.errorMessage = '';
    this.items = undefined;
    if (this.fetchSub) { this.fetchSub.unsubscribe(); }   // lazyFetch teardown cancels stale request

    if (!this.activeQuery) {         // empty-query state: nothing to fetch
      this.items = [];
      return;
    }

    this.fetchSub = this._hackerNewsAPIService.search(this.activeQuery, this.pageNum)
      .subscribe(
        items => this.items = items,
        () => this.errorMessage = `Could not search for "${this.activeQuery}".`,
        () => {
          this.listStart = ((this.pageNum - 1) * 30) + 1;
          window.scrollTo(0, 0);
        }
      );
  }

  submit() {                         // called on form (ngSubmit)
    const q = this.query.trim();
    if (!q) { return; }
    // Always reset to page 1 for a new query
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  ngOnDestroy() { /* unsubscribe routeSub and fetchSub */ }
}
```

Key behaviours:

- **Route params → API:** Like `FeedComponent`, the component never fetches on its own
  timer; it reacts to the URL. Submitting the input only *navigates*; the route
  subscription performs the fetch. This makes back/forward, refresh, and shared links
  all work for free.
- **Stale request cancellation:** because `lazyFetch` returns a cancellable Observable,
  unsubscribing the previous `fetchSub` before starting a new one prevents an old, slow
  response from overwriting newer results.
- **`totalHits` / `totalPages`:** if the implementer wants these, `search()` can be
  widened to return `{ items, nbHits, nbPages }`, or a sibling method can expose the raw
  response. For the strict signature requested (`Observable<Story[]>`), the component
  falls back to the feed heuristic `items.length === 30` to show "More ›". See Open
  Questions.

### 4.4 `search.component.html`

```html
<div class="main-content search">
  <form class="search-form" (ngSubmit)="submit()">
    <input
      type="search"
      name="q"
      [(ngModel)]="query"
      placeholder="Search Hacker News"
      aria-label="Search Hacker News"
      autocomplete="off"
      autofocus>
    <button type="submit" [disabled]="!query.trim()">Search</button>
  </form>

  <!-- Loading (same guards as feed.component.html) -->
  <app-loader *ngIf="!items && !errorMessage"></app-loader>

  <!-- Error -->
  <app-error-message [message]="errorMessage" *ngIf="!items && errorMessage !== ''"></app-error-message>

  <div *ngIf="items">
    <!-- Empty query -->
    <p class="search-hint" *ngIf="!activeQuery">
      Enter a term above to search stories.
    </p>

    <!-- No results -->
    <p class="search-hint" *ngIf="activeQuery && items.length === 0">
      No stories found for “{{ activeQuery }}”.
    </p>

    <!-- Results — identical markup to feed.component.html so item styles apply -->
    <ol *ngIf="items.length > 0" class="list-margin" start="{{ listStart }}">
      <li *ngFor="let item of items" class="post">
        <item class="item-block" [item]="item"></item>
      </li>
    </ol>

    <div class="nav" *ngIf="activeQuery && items.length > 0">
      <a *ngIf="pageNum > 1"
         [routerLink]="['/search', pageNum - 1]" queryParamsHandling="preserve" class="prev">‹ Prev</a>
      <a *ngIf="items.length === 30"
         [routerLink]="['/search', pageNum + 1]" queryParamsHandling="preserve" class="more">More ›</a>
    </div>
  </div>
</div>
```

State matrix:

| State            | Condition                                  | Rendered |
|------------------|--------------------------------------------|----------|
| Empty query      | no `q` in URL                              | input + hint text; no loader, no request |
| Loading          | `items === undefined && !errorMessage`     | input + `<app-loader>` |
| Error            | `!items && errorMessage`                   | input + `<app-error-message>` (skull) |
| No results       | `items.length === 0 && activeQuery`        | input + "No stories found" |
| Results          | `items.length > 0`                         | input + `<ol>` of `<item>` + Prev/More nav |

The input stays visible in every state so the user can refine the query without
navigating away.

### 4.5 `search.component.scss`

- `@import` the same partials the feed uses (`../shared/scss/media`,
  `../shared/scss/theme_variables`).
- Reuse the `.main-content`, `.list-margin`, `.post`, `.item-block`, and `.nav`
  class names from `feed.component.scss` so results are visually indistinguishable from
  a feed page (copy the relevant rules, or promote them to a shared partial — see Open
  Questions).
- `.search-form` — full-width flex row; input grows, button fixed width; on
  `$mobile-only`, stack or shrink the button to fit 320px.
- Input/button colours must come from theme variables (Section 6), not hard-coded
  values.

---

## 5. Header Entry Point

Add a search link to the header (`src/app/core/header/header.component.html`) so the
feature is discoverable from every page.

Proposed placement: inside the existing `.info` container next to the settings cog, as an
icon that routes to `/search`:

```html
<!-- pseudo-diff, header.component.html -->
  <div class="info">
+   <a routerLink="/search" routerLinkActive="active" class="search-link" aria-label="Search" (click)="scrollTop()">
+     <img class="search" src="assets/images/search.svg" alt="Search">
+   </a>
    <img class="settings" src="assets/images/cog.svg" alt="Settings" (click)="toggleSettings()">
  </div>
```

- Requires a new white SVG icon at `src/assets/images/search.svg` matching the style of
  `cog.svg` (single-colour, ~25px).
- `header.component.scss` `.info` currently styles a single `img`; it becomes a flex row
  with a small gap so both icons sit at the right edge. The existing `opacity: .8 →
  1` hover treatment applies to both.
- Alternative placement: as a fifth text link in `.header-nav` (`new | show | ask | jobs |
  search`). This is simpler (no icon asset) but the nav is already tight on 320px mobile
  widths. **The icon-in-`.info` approach is the recommended default; confirm in Open
  Questions.**
- The header is *not* the search input itself (no inline expanding search box) to keep
  the fixed 50px mobile header unchanged. The input lives on the `/search` page.

---

## 6. Theming

The app has three themes applied as a class on the wrapper — `default` (day), `night`, and
`amoledblack` — generated by the `theme()` mixin in
`src/app/shared/scss/_themes.scss` from variables in
`src/app/shared/scss/_theme_variables.scss`.

Requirements:

- **Results list:** by reusing `ItemComponent` and the feed class names, results inherit
  `.wrapper a`, `.subtext-*`, `.domain`, `.nav a`, `.loader`, and `.error-section`
  theming automatically — no new rules needed.
- **Search input / button / hint text:** add a `.search-form` block to the `theme()` mixin
  so each theme styles the new controls from its own variables:

  ```scss
  // inside @mixin theme(...) → .wrapper { ... }
  .search-form {
    input {
      background: $wrapper-background-color;
      color: $wrapper-color;
      border: $border;                    // e.g. 2px solid #b92b27 / #00c0ff
      &::placeholder { color: $subtext-color; }
    }
    button {
      background: $secondary-link-color;
      color: $body-background-color;
    }
  }
  .search-hint { color: $subtext-color; }
  ```

- **Header icon:** the header is always dark/coloured (`#header` background is
  `$header-background-color`) and existing icons are white, so the search SVG is white
  with the same opacity hover — no per-theme override needed.
- **No new colour literals** are introduced in `search.component.scss` or
  `header.component.scss`; every colour flows from `_theme_variables.scss`.
- Manual verification: switch themes in the settings popup while on `/search` in each
  of the five states (Section 4.4) and confirm contrast/readability.

---

## 7. Acceptance Criteria

Functional

- [ ] A search icon/link is visible in the header on desktop and mobile widths; clicking
      it navigates to `/search`.
- [ ] `/search` with no `q` shows the input and an "enter a term" hint; **no** network
      request is made and no loader is shown.
- [ ] Typing a term and pressing Enter (or clicking Search) navigates to
      `/search?q=<term>` and the URL is shareable/refreshable.
- [ ] While the request is in flight, `<app-loader>` is shown (same spinner as feeds).
- [ ] Results render using `<item>` (`ItemComponent`): title, domain, points, author,
      relative time, comment count; clicking title/author/comments behaves exactly as in
      a feed (external link honours `openLinkInNewTab`; comments → `/item/:id`;
      author → `/user/:id`).
- [ ] Results with no `url` (Ask HN / text posts) link to `/item/:id` and do not throw.
- [ ] The `<ol>` numbering starts at `(page - 1) * 30 + 1`.
- [ ] "More ›" appears when a full page is returned and navigates to
      `/search/<page+1>?q=<term>`; "‹ Prev" appears on pages > 1. Query is preserved
      across pagination.
- [ ] Submitting a new term from page N resets to page 1.
- [ ] A query with no matches shows a "No stories found" message (not the loader, not the
      error skull).
- [ ] A network failure (e.g. offline) shows `<app-error-message>` with a
      search-specific message.
- [ ] Special characters in the query (`C++`, `"quoted"`, `a/b`, `?`) are URL-encoded and
      do not break routing or the request.
- [ ] Rapidly changing pages/queries never shows stale results (previous request is
      cancelled).
- [ ] Existing feeds, item, and user pages are unaffected (`ItemComponent` still renders
      in `FeedComponent`).

Non-functional

- [ ] `search` is lazy-loaded: the `SearchModule` chunk is **not** in the initial bundle
      (verify in `ng build` output).
- [ ] The feature is usable and legible in `default`, `night`, and `amoledblack` themes.
- [ ] `npm run build` succeeds.
- [ ] `npm run lint` introduces **no new** lint errors (the repo has pre-existing errors in
      untouched files; compare before/after counts).
- [ ] Existing unit tests still pass
      (`npx ng test --watch=false --browsers=ChromeHeadlessCI`).

---

## 8. Open Questions / Assumptions

1. **Header markup / placement.** Icon next to the settings cog in `.info` (recommended)
   vs. a text link in `.header-nav`? Is a new `search.svg` asset acceptable, or should
   an inline SVG be used?
2. **`ItemComponent` relocation.** Moving `ItemComponent` from `AppModule` into
   `SharedComponentsModule` (Section 4.2) is required for the lazy module to reuse it.
   Confirm this is acceptable vs. creating a separate `ItemModule`.
3. **Page size.** Spec assumes `hitsPerPage=30` to match feeds. Algolia's default is 20.
   Confirm 30.
4. **Service return type.** The requested signature is `Observable<Story[]>`. Exposing
   `nbHits`/`nbPages` would allow an accurate "N results" label and hiding "More ›" on
   the last page instead of the `length === 30` heuristic. Should the signature be
   widened, e.g. `Observable<{ items: Story[]; nbHits: number; nbPages: number }>`, or
   kept strict for v1?
5. **`time_ago` derivation.** Algolia has no relative-time field. Where should the
   helper live — private to the service, a new `TimeAgoPipe` in `PipesModule`, or an
   inline function? Recommend a small pure function in the service file for v1.
6. **Search URL scheme.** Query string `?q=` + path page (`/search/2?q=foo`) is proposed.
   An alternative is fully path-based (`/search/foo/2`), which reads like the feeds but
   needs encoding care. Confirm preference.
7. **Query-param vs. path for the empty state.** Assumed `/search` with no `q` shows a
   hint rather than redirecting to `/news/1`.
8. **Algolia rate limits.** The public API is rate-limited (documented at ~10,000
   req/hour per IP). No API key is planned; confirm that is acceptable for expected
   traffic.
9. **Search-as-you-type.** Out of scope for v1 (submit-on-Enter only). Debounced
    live search could be a follow-up.
10. **Shared feed styles.** Should `.main-content` / `.list-margin` / `.nav` rules be
    promoted from `feed.component.scss` into a shared SCSS partial rather than
    duplicated in `search.component.scss`?
11. **Service worker / offline.** `ngsw-config.json` may need a `dataGroups` entry (or
    explicit exclusion) for `hn.algolia.com` so search requests are not cached
    unexpectedly. Assumed network-only for v1.
