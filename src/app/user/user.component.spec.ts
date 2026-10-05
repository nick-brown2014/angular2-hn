import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'pg',
    crated_time: 1160418092,
    created: '14 years ago',
    karma: 155040,
    avg: null,
    about: 'Bug fixer. <a href="https://paulgraham.com">paulgraham.com</a>',
    ...overrides,
  };
}

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let routeParams: BehaviorSubject<any>;

  function render() {
    fixture = TestBed.createComponent(UserComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    routeParams = new BehaviorSubject({ id: 'pg' });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: routeParams } },
      ],
    });
  });

  it('shows the loader while the profile is loading', () => {
    api.fetchUser.and.returnValue(NEVER);
    render();

    expect(el.querySelector('app-loader')).toBeTruthy();
    expect(el.querySelector('.profile')).toBeNull();
  });

  it('fetches the user from the route id', () => {
    api.fetchUser.and.returnValue(of(createUser()));
    render();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
  });

  it('renders the user profile', () => {
    api.fetchUser.and.returnValue(of(createUser()));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.main-details .name').textContent).toBe('pg');
    expect(el.querySelector('.main-details .right').textContent).toBe('155040 ★');
    expect(el.querySelector('.main-details .age').textContent).toBe('Created 14 years ago');
    expect(el.querySelector('.title-block').textContent).toContain('Profile: pg');

    const about = el.querySelector('.other-details p');
    expect(about.textContent).toBe('Bug fixer. paulgraham.com');
    expect(about.querySelector('a').getAttribute('href')).toBe('https://paulgraham.com');
  });

  it('omits the about section when the user has none', () => {
    api.fetchUser.and.returnValue(of(createUser({ about: '' })));
    render();

    expect(el.querySelector('.profile')).toBeTruthy();
    expect(el.querySelector('.other-details')).toBeNull();
  });

  it('shows an error message when the profile fails to load', () => {
    routeParams.next({ id: 'ghost' });
    api.fetchUser.and.returnValue(throwError('404'));
    render();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.profile')).toBeNull();
    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load user ghost.');
  });

  it('navigates back when the back button is clicked', () => {
    api.fetchUser.and.returnValue(of(createUser()));
    render();
    const back = spyOn(TestBed.inject(Location), 'back');

    (el.querySelector('.back-button') as HTMLElement).click();
    expect(back).toHaveBeenCalled();
  });
});
