import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

describe('UserComponent', () => {
  let component: UserComponent;
  let mockHackerNewsAPIService: any;
  let mockLocation: any;

  const mockUser = {
    id: 'testuser',
    karma: 1000,
    created: '2015-01-01',
    about: 'Test user bio'
  };

  beforeEach(async(() => {
    mockHackerNewsAPIService = {
      fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(mockUser))
    };

    mockLocation = {
      back: jasmine.createSpy('back')
    };

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'testuser' }) } },
        { provide: Location, useValue: mockLocation }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to route params and call fetchUser(id)', () => {
    expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
  });

  it('should set user when API succeeds', () => {
    expect(component.user).toEqual(mockUser as any);
  });

  it('should set errorMessage when API fails', () => {
    mockHackerNewsAPIService.fetchUser.and.returnValue(throwError('error'));

    const fixture = TestBed.createComponent(UserComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.errorMessage).toBe('Could not load user testuser.');
  });

  it('goBack() should call Location.back()', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
