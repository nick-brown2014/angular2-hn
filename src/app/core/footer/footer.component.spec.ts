import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(FooterComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});
