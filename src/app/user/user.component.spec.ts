import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let apiServiceStub: any;
  let locationStub: any;
  let paramsSubject: BehaviorSubject<any>;

  const mockUser: any = {
    id: 'testuser',
    karma: 12345,
    created: '2020-01-01',
    about: 'Hello there'
  };

  beforeEach(() => {
    paramsSubject = new BehaviorSubject<any>({ id: 'testuser' });

    apiServiceStub = {
      fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(mockUser))
    };

    locationStub = {
      back: jasmine.createSpy('back')
    };

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiServiceStub },
        { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
        { provide: Location, useValue: locationStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit calls fetchUser with the user id from the route', () => {
    fixture.detectChanges();
    expect(apiServiceStub.fetchUser).toHaveBeenCalledWith('testuser');
  });

  it('sets user on a successful fetch', () => {
    fixture.detectChanges();
    expect(component.user).toEqual(mockUser);
  });

  it('sets errorMessage with the user id on a failed fetch', () => {
    apiServiceStub.fetchUser.and.returnValue(throwError(() => new Error('boom')));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load user testuser.');
  });

  it('goBack() delegates to Location.back()', () => {
    component.goBack();
    expect(locationStub.back).toHaveBeenCalled();
  });
});
