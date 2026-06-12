import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockHnService: any;
  let mockLocation: any;

  const mockUser: User = {
    id: 'testuser',
    crated_time: 123,
    created: '2020-01-01',
    karma: 100,
    avg: 5,
    about: 'A test user'
  };

  beforeEach(async(() => {
    mockHnService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    mockHnService.fetchUser.and.returnValue(of(mockUser));

    mockLocation = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHnService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'testuser' }) } },
        { provide: Location, useValue: mockLocation }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchUser with the route param ID', () => {
    expect(mockHnService.fetchUser).toHaveBeenCalledWith('testuser');
  });

  it('should populate user on success', () => {
    expect(component.user).toEqual(mockUser);
  });

  it('should set errorMessage on error (includes user ID)', () => {
    mockHnService.fetchUser.and.returnValue(throwError('error'));
    component.ngOnInit();
    expect(component.errorMessage).toBe('Could not load user testuser.');
  });

  it('goBack() should call _location.back()', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
