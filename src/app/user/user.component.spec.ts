import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  const user = { id: 'pg', karma: 155, created: '15 years ago' } as User;

  beforeEach(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('is created', () => {
    apiService.fetchUser.and.returnValue(of(user));

    expect(component).toBeTruthy();
  });

  it('loads the profile for the route user id', () => {
    apiService.fetchUser.and.returnValue(of(user));

    fixture.detectChanges();

    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
    expect(component.errorMessage).toBe('');
  });

  it('renders the profile once loaded', () => {
    apiService.fetchUser.and.returnValue(of(user));

    fixture.detectChanges();

    const profile = fixture.nativeElement.querySelector('.profile');
    expect(profile.textContent).toContain('pg');
    expect(profile.textContent).toContain('155');
  });

  it('sets an error message naming the user when loading fails', () => {
    apiService.fetchUser.and.returnValue(throwError('not found'));

    fixture.detectChanges();

    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('goBack navigates back through Location', () => {
    apiService.fetchUser.and.returnValue(of(user));

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
