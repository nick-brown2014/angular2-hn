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
  let apiService: { fetchUser: jasmine.Spy };
  let location: { back: jasmine.Spy };

  const user = { id: 'pg', karma: 155000, created: 'October 9, 2006' } as User;

  function createComponent() {
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    apiService = { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(user)) };
    location = { back: jasmine.createSpy('back') };
  });

  it('should create and load the routed user', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
  });

  it('should set an error message when the user cannot be loaded', () => {
    apiService.fetchUser.and.returnValue(throwError(new Error('offline')));

    createComponent();

    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('goBack should navigate back through history', () => {
    createComponent();

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
