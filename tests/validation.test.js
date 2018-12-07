const expect = require('expect');
const validation = require('./../utils/validation');

describe('Validation utils', () => {
    describe('Credit card number validation', () => {
        it('should return true for \'1111-2222-3333-4444\'', () => {
            var check = validation.isCreditCardNumber('1111-2222-3333-4444');
            expect(check).toBe(true);
        });

        it('should return true for \'1111222233334444\'', () => {
            var check = validation.isCreditCardNumber('1111222233334444');
            expect(check).toBe(true);
        });

        it('should return true for 1111222233334444', () => {
            var check = validation.isCreditCardNumber(1111222233334444);
            expect(check).toBe(true);
        });

        it('should return false for \'123\'', () => {
            var check = validation.isCreditCardNumber('123');
            expect(check).toBe(false);
        });

        it('should return false for 123', () => {
            var check = validation.isCreditCardNumber(123);
            expect(check).toBe(false);
        });

        it('should return false for undefined', () => {
            var check = validation.isCreditCardNumber();
            expect(check).toBe(false);
        });

        it('should return false for null', () => {
            var check = validation.isCreditCardNumber(null);
            expect(check).toBe(false);
        });

        it('should return false for \'\'', () => {
            var check = validation.isCreditCardNumber('');
            expect(check).toBe(false);
        });

        it('should return false for \'abc\'', () => {
            var check = validation.isCreditCardNumber('abc');
            expect(check).toBe(false);
        });
    })

    describe('Email validation', () => {
        it('should return true for \'james@live.co.uk\'', () => {
            var check = validation.isEmail('james@live.co.uk');
            expect(check).toBe(true);
        });

        it('should return true for \'james@outlook.com\'', () => {
            var check = validation.isEmail('james@outlook.com');
            expect(check).toBe(true);
        });

        it('should return false for \'j.com\'', () => {
            var check = validation.isEmail('j.com');
            expect(check).toBe(false);
        });

        it('should return false for 123', () => {
            var check = validation.isEmail(123);
            expect(check).toBe(false);
        });

        it('should return false for undefined', () => {
            var check = validation.isEmail();
            expect(check).toBe(false);
        });

        it('should return false for null', () => {
            var check = validation.isEmail(null);
            expect(check).toBe(false);
        });

        it('should return false for \'\'', () => {
            var check = validation.isEmail('');
            expect(check).toBe(false);
        });
    })
});