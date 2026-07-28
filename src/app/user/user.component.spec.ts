import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
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
  const user = { id: 'pg', karma: 100 } as User;

  const createComponent = () => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(() => {
    apiService = { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(user)) };
    location = { back: jasmine.createSpy('back') };

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }), data: of({}) } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load the user on init', () => {
    createComponent();
    component.ngOnInit();

    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toEqual(user);
  });

  it('should set an error message when the user fails to load', () => {
    apiService.fetchUser.and.returnValue(throwError('boom'));
    createComponent();
    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('should navigate back', () => {
    createComponent();
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
