import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let apiServiceSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let paramsSubject: BehaviorSubject<{ [key: string]: string }>;

  function makeUser(overrides: Partial<User> = {}): User {
    return {
      id: 'alice',
      crated_time: 0,
      created: '2020-01-01',
      karma: 100,
      avg: 0,
      about: 'A user',
      ...overrides
    } as User;
  }

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    apiServiceSpy.fetchUser.and.returnValue(of(makeUser()));

    locationSpy = jasmine.createSpyObj<Location>('Location', ['back']);

    paramsSubject = new BehaviorSubject<{ [key: string]: string }>({ id: 'alice' });

    await TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiServiceSpy },
        { provide: Location, useValue: locationSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should fetch the user using the route param id', () => {
    fixture.detectChanges();
    expect(apiServiceSpy.fetchUser).toHaveBeenCalledWith('alice');
  });

  it('should set user on a successful API response', () => {
    const user = makeUser({ id: 'bob', karma: 9 });
    apiServiceSpy.fetchUser.and.returnValue(of(user));
    paramsSubject.next({ id: 'bob' });
    fixture.detectChanges();
    expect(component.user).toEqual(user);
  });

  it('should set errorMessage including the user id on API error', () => {
    apiServiceSpy.fetchUser.and.returnValue(throwError(new Error('boom')));
    paramsSubject.next({ id: 'bob' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load user bob.');
  });

  it('goBack should call Location.back()', () => {
    fixture.detectChanges();
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
