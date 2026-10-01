import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';
import { mockUser } from '../testing/mock-data';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let routeParams: BehaviorSubject<{ id: string }>;

  function render(user?: User) {
    if (user) {
      api.fetchUser.and.returnValue(of(user));
    }
    fixture = TestBed.createComponent(UserComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    routeParams = new BehaviorSubject({ id: 'pg' });

    TestBed.configureTestingModule({
      imports: [SharedComponentsModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: routeParams } },
        { provide: Location, useValue: location }
      ]
    });
  });

  it('fetches the user named in the route', () => {
    render(mockUser());
    expect(api.fetchUser).toHaveBeenCalledWith('pg');
  });

  it('shows the loader until the profile arrives', () => {
    api.fetchUser.and.returnValue(new Subject<User>());

    render();

    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('.profile')).toBeNull();
  });

  it('renders the profile name, karma, age and about HTML', () => {
    render(mockUser({ id: 'pg', karma: 157316, created: '19 years ago', about: '<p>Bug <a href="#">fixer</a>.</p>' }));

    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('.title-block').textContent).toContain('Profile: pg');
    expect(element.querySelector('.main-details .name').textContent).toBe('pg');
    expect(element.querySelector('.main-details .right').textContent).toBe('157316 ★');
    expect(element.querySelector('.main-details .age').textContent).toBe('Created 19 years ago');
    expect(element.querySelector('.other-details a').textContent).toBe('fixer');
  });

  it('omits the about section when the user has none', () => {
    render(mockUser({ about: '' }));
    expect(element.querySelector('.other-details')).toBeNull();
  });

  it('shows an error message naming the user when loading fails', () => {
    api.fetchUser.and.returnValue(throwError(new Error('404')));

    render();

    expect(element.querySelector('.profile')).toBeNull();
    expect(element.querySelector('app-error-message .strong').textContent).toBe('Could not load user pg.');
  });

  it('loads a different profile when the route param changes', () => {
    render(mockUser());
    api.fetchUser.and.returnValue(of(mockUser({ id: 'dang', karma: 42 })));

    routeParams.next({ id: 'dang' });
    fixture.detectChanges();

    expect(api.fetchUser).toHaveBeenCalledWith('dang');
    expect(element.querySelector('.main-details .name').textContent).toBe('dang');
  });

  it('navigates back when the back button is clicked', () => {
    render(mockUser());

    element.querySelector<HTMLElement>('.back-button').click();

    expect(location.back).toHaveBeenCalled();
  });
});
