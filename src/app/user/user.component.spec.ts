import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { ActivatedRouteStub, createHackerNewsApiSpy, makeUser } from '../../testing/mocks';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let route: ActivatedRouteStub;
  let location: jasmine.SpyObj<Location>;

  function render() {
    fixture = TestBed.createComponent(UserComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = createHackerNewsApiSpy();
    route = new ActivatedRouteStub({ id: 'pg' });
    location = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      imports: [SharedComponentsModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: route },
        { provide: Location, useValue: location },
      ],
    });
  });

  it('fetches the user named in the route and shows the loader meanwhile', () => {
    api.fetchUser.and.returnValue(NEVER);
    render();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.profile')).toBeNull();
  });

  it('renders the profile', () => {
    api.fetchUser.and.returnValue(of(makeUser({
      id: 'pg',
      karma: 155111,
      created: '19 years ago',
      about: '<p>Hi <a href="https://x.y">me</a></p>',
    })));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.title-block').textContent.trim()).toBe('Profile: pg');
    expect(el.querySelector('.main-details .name').textContent).toBe('pg');
    expect(el.querySelector('.main-details .right').textContent).toBe('155111 ★');
    expect(el.querySelector('.main-details .age').textContent).toBe('Created 19 years ago');
    expect(el.querySelector('.other-details a').getAttribute('href')).toBe('https://x.y');
  });

  it('omits the about section when the user has none', () => {
    api.fetchUser.and.returnValue(of(makeUser({ about: '' })));
    render();

    expect(el.querySelector('.other-details')).toBeNull();
  });

  it('shows an error naming the user when loading fails', () => {
    api.fetchUser.and.returnValue(throwError(new Error('404')));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load user pg.');
  });

  it('goes back when the back button is clicked', () => {
    api.fetchUser.and.returnValue(of(makeUser()));
    render();

    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });

  it('loads a different user when the route changes', () => {
    api.fetchUser.and.returnValue(of(makeUser({ id: 'pg' })));
    render();

    api.fetchUser.and.returnValue(of(makeUser({ id: 'dang' })));
    route.params.next({ id: 'dang' });
    fixture.detectChanges();

    expect(api.fetchUser).toHaveBeenCalledWith('dang');
    expect(el.querySelector('.main-details .name').textContent).toBe('dang');
  });
});
