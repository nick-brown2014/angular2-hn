import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let apiSpy: jasmine.SpyObj<HackerNewsAPIService>;

  function createComponent(params: any, userResult: any): UserComponent {
    apiSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    apiSpy.fetchUser.and.returnValue(userResult);

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiSpy },
        { provide: ActivatedRoute, useValue: { params: of(params) } },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) }
      ]
    });
    TestBed.overrideTemplate(UserComponent, '');

    const fixture = TestBed.createComponent(UserComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const component = createComponent({ id: 'pg' }, of({ id: 'pg' } as User));
    expect(component).toBeTruthy();
  });

  it('should fetch the user from the id param and set user on success', () => {
    const user = { id: 'pg', karma: 100 } as User;
    const component = createComponent({ id: 'pg' }, of(user));
    expect(apiSpy.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toEqual(user);
  });

  it('should set errorMessage when the user fetch fails', () => {
    const component = createComponent({ id: 'ghost' }, throwError('boom'));
    expect(component.errorMessage).toBe('Could not load user ghost.');
  });
});
