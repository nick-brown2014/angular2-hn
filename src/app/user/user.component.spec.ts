import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let routeParams: Subject<any>;

  const user: User = {
    id: 'pg',
    crated_time: 0,
    created: '10 years ago',
    karma: 155000,
    avg: 0,
    about: '<p>Founder of <i>YC</i></p>'
  };

  beforeEach(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    routeParams = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: routeParams.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows the loader before the user loads', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.profile')).toBeNull();
  });

  it('fetches the user for the route id', () => {
    apiService.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();

    routeParams.next({ id: 'pg' });

    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
    expect(component.errorMessage).toBe('');
  });

  it('renders the profile details', () => {
    apiService.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    routeParams.next({ id: 'pg' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.name').textContent).toBe('pg');
    expect(el.querySelector('.right').textContent).toContain('155000');
    expect(el.querySelector('.age').textContent).toBe('Created 10 years ago');
    expect(el.querySelector('.other-details p').innerHTML).toContain('<i>YC</i>');
  });

  it('omits the about section when the user has no bio', () => {
    apiService.fetchUser.and.returnValue(of({ ...user, about: undefined }));
    fixture.detectChanges();
    routeParams.next({ id: 'pg' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.other-details')).toBeNull();
  });

  it('sets errorMessage and shows the error component when the fetch fails', () => {
    apiService.fetchUser.and.returnValue(throwError(new Error('404')));
    fixture.detectChanges();
    routeParams.next({ id: 'nobody' });
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load user nobody.');
    expect(component.user).toBeUndefined();
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });

  it('goBack navigates back via Location', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
