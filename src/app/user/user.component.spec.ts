import { CommonModule, Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let apiService: { fetchUser: jasmine.Spy };
  let location: { back: jasmine.Spy };

  const user = { id: 'pg', karma: 1000, created: 'October 9, 2006' } as User;

  function configure(result: Observable<User>): void {
    apiService = { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(result) };
    location = { back: jasmine.createSpy('back') };

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      imports: [CommonModule],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  }

  it('creates', () => {
    configure(of(user));

    expect(component).toBeTruthy();
    expect(component.errorMessage).toBe('');
  });

  it('ngOnInit loads the user for the route id', () => {
    configure(of(user));

    component.ngOnInit();

    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toEqual(user);
  });

  it('ngOnInit sets an error message when the user cannot be loaded', () => {
    configure(throwError(new Error('offline')));

    component.ngOnInit();

    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('renders the profile once loaded', () => {
    configure(of(user));

    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('pg');
    expect(fixture.nativeElement.textContent).toContain('1000');
  });

  it('goBack navigates back through Location', () => {
    configure(of(user));

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
