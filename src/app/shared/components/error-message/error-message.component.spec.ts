import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(ErrorMessageComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should accept @Input() message', () => {
        const fixture = TestBed.createComponent(ErrorMessageComponent);
        fixture.componentInstance.message = 'Something went wrong';
        fixture.detectChanges();
        expect(fixture.componentInstance.message).toBe('Something went wrong');
    });
});
