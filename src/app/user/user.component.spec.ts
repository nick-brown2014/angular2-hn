import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let apiService: { fetchUser: jasmine.Spy };
  let location: { back: jasmine.Spy };
  let params: Subject<any>;

  const user = { id: 'pg', karma: 155000, created: '4000 days ago' } as User;

  beforeEach(() => {
    params = new Subject<any>();
    apiService = { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(user)) };
    location = { back: jasmine.createSpy('back') };

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { params } },
        { provide: Location, useValue: location }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(component.errorMessage).toBe('');
  });

  it('loads the routed user', () => {
    component.ngOnInit();
    params.next({ id: 'pg' });

    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
  });

  it('sets an error message when the user cannot be loaded', () => {
    apiService.fetchUser.and.returnValue(throwError('boom'));

    component.ngOnInit();
    params.next({ id: 'nobody' });

    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user nobody.');
  });

  it('goes back through the location service', () => {
    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });

  it('renders the loaded profile', () => {
    component.ngOnInit();
    params.next({ id: 'pg' });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('pg');
    expect(text).toContain('155000');
  });
});
