import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { ActivatedRouteStub, createHackerNewsApiStub, makeUser, provideActivatedRoute } from '../../testing/mocks';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let route: ActivatedRouteStub;
  let location: jasmine.SpyObj<Location>;

  function text(selector: string): string {
    return el.querySelector(selector).textContent.replace(/\s+/g, ' ').trim();
  }

  beforeEach(() => {
    api = createHackerNewsApiStub();
    api.fetchUser.and.returnValue(of(makeUser({ about: 'Bug fixer. <a href="http://paulgraham.com">paulgraham.com</a>' })));
    route = new ActivatedRouteStub({ id: 'pg' });
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      imports: [SharedComponentsModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: Location, useValue: location },
        provideActivatedRoute(route),
      ],
    });
    fixture = TestBed.createComponent(UserComponent);
    el = fixture.nativeElement;
  });

  it('loads the user from the route id', () => {
    fixture.detectChanges();
    expect(api.fetchUser).toHaveBeenCalledWith('pg');
  });

  it('renders the profile fields', () => {
    fixture.detectChanges();

    expect(text('.main-details .name')).toBe('pg');
    expect(text('.main-details .right')).toBe('157316 ★');
    expect(text('.main-details .age')).toBe('Created 20 years ago');
    expect(text('.mobile .title-block')).toBe('Profile: pg');
  });

  it('renders the about section as HTML', () => {
    fixture.detectChanges();

    expect(text('.other-details p')).toBe('Bug fixer. paulgraham.com');
    expect(el.querySelector('.other-details a').getAttribute('href')).toBe('http://paulgraham.com');
  });

  it('omits the about section when the user has none', () => {
    api.fetchUser.and.returnValue(of(makeUser({ about: '' })));
    fixture.detectChanges();
    expect(el.querySelector('.other-details')).toBeNull();
  });

  it('reloads when the route id changes', () => {
    fixture.detectChanges();
    api.fetchUser.and.returnValue(of(makeUser({ id: 'dang', karma: 99 })));

    route.setParams({ id: 'dang' });
    fixture.detectChanges();

    expect(api.fetchUser).toHaveBeenCalledWith('dang');
    expect(text('.main-details .name')).toBe('dang');
  });

  it('shows the loader while the user is loading', () => {
    api.fetchUser.and.returnValue(NEVER);
    fixture.detectChanges();

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.profile')).toBeNull();
  });

  it('shows an error message when the user fails to load', () => {
    api.fetchUser.and.returnValue(throwError(new Error('404')));
    fixture.detectChanges();

    expect(text('app-error-message .strong')).toBe('Could not load user pg.');
    expect(el.querySelector('app-loader')).toBeNull();
  });

  it('goes back when the back button is clicked', () => {
    fixture.detectChanges();
    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });
});
