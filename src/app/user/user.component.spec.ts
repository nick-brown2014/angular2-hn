import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { createHackerNewsAPIServiceSpy, createUser } from '../../testing/mocks';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let el: HTMLElement;

  beforeEach(() => {
    api = createHackerNewsAPIServiceSpy();
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [UserComponent, LoaderComponent, ErrorMessageComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } },
        { provide: Location, useValue: location },
      ],
    });

    fixture = TestBed.createComponent(UserComponent);
    el = fixture.nativeElement;
  });

  it('shows the loader while the user is loading', () => {
    api.fetchUser.and.returnValue(NEVER);
    fixture.detectChanges();

    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.profile')).toBeNull();
  });

  it('fetches the user from the route id and renders the profile', () => {
    api.fetchUser.and.returnValue(of(createUser({ id: 'pg', karma: 1234, created: '19 years ago', about: '<p>Hi</p>' })));
    fixture.detectChanges();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(el.querySelector('.name').textContent).toBe('pg');
    expect(el.querySelector('.right').textContent).toContain('1234');
    expect(el.querySelector('.age').textContent).toBe('Created 19 years ago');
    expect(el.querySelector('.other-details p').innerHTML).toBe('<p>Hi</p>');
    expect(el.querySelector('.title-block').textContent).toContain('Profile: pg');
  });

  it('omits the about section when empty', () => {
    api.fetchUser.and.returnValue(of(createUser({ about: '' })));
    fixture.detectChanges();

    expect(el.querySelector('.other-details')).toBeNull();
  });

  it('shows an error message when the user fails to load', () => {
    api.fetchUser.and.returnValue(throwError(new Error('404')));
    fixture.detectChanges();

    expect(el.querySelector('app-error-message .strong').textContent).toBe('Could not load user pg.');
    expect(el.querySelector('app-loader')).toBeNull();
  });

  it('navigates back with the back button', () => {
    api.fetchUser.and.returnValue(of(createUser()));
    fixture.detectChanges();

    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });
});
