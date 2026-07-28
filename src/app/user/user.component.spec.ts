import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let apiService: { fetchUser: jasmine.Spy };
  let location: { back: jasmine.Spy };
  let user: User;

  const configure = () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
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
  };

  beforeEach(() => {
    user = { id: 'pg', karma: 155000, created: 'October 18, 2006' } as User;
    apiService = { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(user)) };
    location = { back: jasmine.createSpy('back') };
  });

  it('should create', () => {
    configure();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the user identified by the route param', () => {
    configure();
    fixture.detectChanges();

    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
    expect(fixture.nativeElement.textContent).toContain('pg');
  });

  it('should set an error message when the user cannot be loaded', () => {
    apiService.fetchUser.and.returnValue(throwError('boom'));
    configure();
    fixture.detectChanges();

    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('should navigate back through Location', () => {
    configure();
    fixture.detectChanges();

    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
