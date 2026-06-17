import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
    let mockHNService: any;
    let mockLocation: any;
    let paramsSubject: Subject<any>;

    const mockUser: User = {
        id: 'testuser', crated_time: 0, created: '2020-01-01',
        karma: 100, avg: 0, about: 'Test user',
    };

    beforeEach(async(() => {
        paramsSubject = new Subject();

        mockHNService = {
            fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(mockUser)),
        };

        mockLocation = {
            back: jasmine.createSpy('back'),
        };

        TestBed.configureTestingModule({
            declarations: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
                { provide: Location, useValue: mockLocation },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(UserComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should subscribe to route params and call fetchUser on init', () => {
        const fixture = TestBed.createComponent(UserComponent);
        fixture.detectChanges();

        paramsSubject.next({ id: 'testuser' });
        expect(mockHNService.fetchUser).toHaveBeenCalledWith('testuser');
    });

    it('should set user from API response', () => {
        const fixture = TestBed.createComponent(UserComponent);
        fixture.detectChanges();

        paramsSubject.next({ id: 'testuser' });
        expect(fixture.componentInstance.user).toEqual(mockUser);
    });

    it('should set errorMessage with user ID on API error', () => {
        mockHNService.fetchUser.and.returnValue(throwError('error'));
        const fixture = TestBed.createComponent(UserComponent);
        fixture.detectChanges();

        paramsSubject.next({ id: 'testuser' });
        expect(fixture.componentInstance.errorMessage).toBe('Could not load user testuser.');
    });

    it('goBack should call _location.back()', () => {
        const fixture = TestBed.createComponent(UserComponent);
        fixture.componentInstance.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });
});
