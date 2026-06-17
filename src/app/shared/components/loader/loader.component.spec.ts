import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoaderComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(LoaderComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});
