import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let params$: BehaviorSubject<any>;

  const user: User = {
    id: 'pg',
    created: '17 years ago',
    karma: 155111,
    about: '<p>Bug fixer.</p>',
  } as any;

  beforeEach(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj('Location', ['back']);
    params$ = new BehaviorSubject({ id: 'pg' });

    TestBed.configureTestingModule({
      imports: [SharedComponentsModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: params$ } },
        { provide: Location, useValue: location },
      ],
    });

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('fetches the user for the id route param and renders the profile', () => {
    api.fetchUser.and.returnValue(of(user));

    fixture.detectChanges();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.main-details .name').textContent).toContain('pg');
    expect(el.querySelector('.main-details .right').textContent).toContain('155111');
    expect(el.querySelector('.age').textContent).toContain('Created 17 years ago');
    expect(el.querySelector('.other-details').innerHTML).toContain('Bug fixer.');
  });

  it('shows the loader until the user loads', () => {
    api.fetchUser.and.returnValue(NEVER);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-loader')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.profile')).toBeNull();
  });

  it('refetches when the id param changes', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();

    params$.next({ id: 'dang' });

    expect(api.fetchUser.calls.allArgs()).toEqual([['pg'], ['dang']]);
  });

  it('sets and renders an error message when the user fails to load', () => {
    api.fetchUser.and.returnValue(throwError(new Error('404')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load user pg.');
    expect(fixture.nativeElement.querySelector('app-error-message').textContent)
      .toContain('Could not load user pg.');
  });

  it('goBack() navigates back via Location', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.back-button').click();

    expect(location.back).toHaveBeenCalled();
  });
});
