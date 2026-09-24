import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let params$: Subject<any>;
  let api: { fetchUser: jasmine.Spy };
  let location: { back: jasmine.Spy };

  const user = {
    id: 'pg',
    created: '10 years ago',
    karma: 155000,
    about: '<p>Founder</p>'
  } as User;

  beforeEach(async () => {
    params$ = new Subject<any>();
    api = { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(user)) };
    location = { back: jasmine.createSpy('back') };

    await TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('shows the loader until the user arrives', () => {
    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
  });

  it('fetches and renders the user from the route id', () => {
    params$.next({ id: 'pg' });
    fixture.detectChanges();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toEqual(user);
    expect(component.errorMessage).toBe('');

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.name').textContent).toBe('pg');
    expect(el.querySelector('.right').textContent).toContain('155000');
    expect(el.querySelector('.age').textContent).toBe('Created 10 years ago');
    expect(el.querySelector('.other-details p').innerHTML).toBe('<p>Founder</p>');
  });

  it('omits the about section when the user has none', () => {
    api.fetchUser.and.returnValue(of({ ...user, about: undefined }));
    params$.next({ id: 'pg' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.other-details')).toBeNull();
  });

  it('sets an error message when the fetch fails', () => {
    api.fetchUser.and.returnValue(throwError(new Error('404')));
    params$.next({ id: 'ghost' });
    fixture.detectChanges();

    expect(component.user).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load user ghost.');
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });

  it('goBack delegates to Location.back', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
