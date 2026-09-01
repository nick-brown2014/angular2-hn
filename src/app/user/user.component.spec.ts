import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let routeParams: Subject<any>;

  const user = { id: 'pg', karma: 1000, created: '10 years ago', about: 'hi' } as User;

  beforeEach(async(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    routeParams = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { params: routeParams.asObservable() } },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the user for the route id', () => {
    apiService.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    routeParams.next({ id: 'pg' });

    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
    expect(component.errorMessage).toBe('');
  });

  it('sets errorMessage when the user cannot be loaded', () => {
    apiService.fetchUser.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();
    routeParams.next({ id: 'nobody' });

    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user nobody.');
  });

  it('goBack() navigates back', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalledTimes(1);
  });
});
