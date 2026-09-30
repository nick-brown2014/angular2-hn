import { Location } from '@angular/common';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { User } from '../shared/models/user';
import { createHackerNewsAPIServiceSpy } from '../shared/testing/mocks';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;

  const user = {
    id: 'pg',
    created: '13 years ago',
    karma: 155111,
    about: 'Bug fixer. <a href="https://paulgraham.com">Essays</a>'
  } as User;

  function createFixture() {
    fixture = TestBed.createComponent(UserComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = createHackerNewsAPIServiceSpy();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } }
      ]
    });
  });

  it('should show the loader while the user is loading', () => {
    api.fetchUser.and.returnValue(new Subject<User>());
    createFixture();

    expect(element.querySelector('app-loader')).toBeTruthy();
    expect(element.querySelector('.profile')).toBeNull();
  });

  it('should fetch the user from the route id and render their profile', () => {
    api.fetchUser.and.returnValue(of(user));
    createFixture();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('.title-block').textContent.trim()).toBe('Profile: pg');
    expect(element.querySelector('.main-details .name').textContent).toBe('pg');
    expect(element.querySelector('.main-details .right').textContent).toBe('155111 ★');
    expect(element.querySelector('.main-details .age').textContent).toBe('Created 13 years ago');
    expect(element.querySelector('.other-details a').getAttribute('href')).toBe('https://paulgraham.com');
  });

  it('should omit the about section when the user has none', () => {
    api.fetchUser.and.returnValue(of({ ...user, about: undefined }));
    createFixture();

    expect(element.querySelector('.profile')).toBeTruthy();
    expect(element.querySelector('.other-details')).toBeNull();
  });

  it('should navigate back when the back button is clicked', () => {
    api.fetchUser.and.returnValue(of(user));
    createFixture();
    const location = TestBed.inject(Location);
    spyOn(location, 'back');

    (element.querySelector('.back-button') as HTMLElement).click();

    expect(location.back).toHaveBeenCalled();
  });

  it('should show an error message when the user fails to load', () => {
    api.fetchUser.and.returnValue(throwError(new Error('Not found')));
    createFixture();

    expect(element.querySelector('app-loader')).toBeNull();
    expect(element.querySelector('app-error-message .strong').textContent).toBe('Could not load user pg.');
  });
});
