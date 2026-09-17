import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  const user = { id: 'pg', karma: 1000, created: 'a while ago' } as User;

  beforeEach(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    apiService.fetchUser.and.returnValue(of(user));
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('populates user on success', () => {
    fixture.detectChanges();
    expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toEqual(user);
    expect(component.errorMessage).toBe('');
  });

  it('sets errorMessage on error', () => {
    apiService.fetchUser.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();
    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('goBack() calls Location.back', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
