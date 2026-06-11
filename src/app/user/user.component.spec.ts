import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockHnService: any;
  let mockLocation: any;
  let paramsSubject: BehaviorSubject<any>;

  const mockUser: User = {
    id: 'testuser',
    crated_time: 1234567890,
    created: '10 years ago',
    karma: 500,
    avg: 10,
    about: 'Hello world'
  };

  beforeEach(async(() => {
    paramsSubject = new BehaviorSubject({ id: 'testuser' });

    mockHnService = {
      fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(mockUser))
    };

    mockLocation = {
      back: jasmine.createSpy('back')
    };

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHnService },
        { provide: ActivatedRoute, useValue: { params: paramsSubject } },
        { provide: Location, useValue: mockLocation }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user using route param id on ngOnInit', () => {
    fixture.detectChanges();
    expect(mockHnService.fetchUser).toHaveBeenCalledWith('testuser');
  });

  it('should populate user on success', () => {
    fixture.detectChanges();
    expect(component.user).toEqual(mockUser);
  });

  it('should set errorMessage on error', () => {
    mockHnService.fetchUser.and.returnValue(throwError('fail'));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load user testuser.');
  });

  describe('goBack', () => {
    it('should call _location.back()', () => {
      component.goBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  it('should fetch new user when route params change', () => {
    fixture.detectChanges();
    const newUser: User = { ...mockUser, id: 'anotheruser', karma: 1000 };
    mockHnService.fetchUser.and.returnValue(of(newUser));
    paramsSubject.next({ id: 'anotheruser' });
    expect(mockHnService.fetchUser).toHaveBeenCalledWith('anotheruser');
    expect(component.user).toEqual(newUser);
  });

  it('should render user id in template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('testuser');
  });

  it('should render user karma in template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('500');
  });

  it('should render user created date in template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('10 years ago');
  });
});
