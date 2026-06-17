import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
    let routerEventsSubject: Subject<any>;
    let mockSettingsService: any;

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

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should assign settings from SettingsService', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.settings).toBe(mockSettingsService.settings);
    });

    it('should call ga on NavigationEnd events', () => {
        (window as any).ga = jasmine.createSpy('ga');

        const fixture = TestBed.createComponent(AppComponent);
        const router = TestBed.get(Router);

        router.events.subscribe(() => {});
        // Trigger a NavigationEnd through the real router by navigating
        router.navigate(['/']).then(() => {
            // NavigationEnd is dispatched by the router
            if ((window as any).ga.calls) {
                expect((window as any).ga).toHaveBeenCalled();
            }
        });
    });
});
