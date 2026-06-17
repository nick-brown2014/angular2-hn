import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
    let routerEventsSubject: Subject<any>;
    let mockSettingsService: any;
    let mockRouter: any;

    beforeEach(async(() => {
        routerEventsSubject = new Subject();

        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
        };

        mockRouter = {
            events: routerEventsSubject.asObservable(),
        };

        TestBed.configureTestingModule({
            declarations: [AppComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Router, useValue: mockRouter },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should assign settings from SettingsService', () => {
        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance.settings).toBe(mockSettingsService.settings);
    });

    it('should call ga on NavigationEnd events', () => {
        (window as any).ga = jasmine.createSpy('ga');

        const fixture = TestBed.createComponent(AppComponent);

        routerEventsSubject.next(new NavigationEnd(1, '/news/1', '/news/1'));

        expect((window as any).ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect((window as any).ga).toHaveBeenCalledWith('send', 'pageview');
    });
});
