import { assertHTMLElement, assertHTMLInputElement, assertHTMLSelectElement } from '../../src/final/js/ui/utils.js';

describe('assertHTMLElement', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="div"></div>
            <input id="input" />
            <select id="select"></select>
        `;
    });

    test('passes through and returns an HTMLElement', () => {
        const div = document.getElementById('div');
        const result = assertHTMLElement(div);
        expect(result).toBe(div);
    });

    test('passes through and returns an HTMLInputElement (subclass of HTMLElement)', () => {
        const input = document.getElementById('input');
        const result = assertHTMLElement(input);
        expect(result).toBe(input);
    });

    test('throws for null', () => {
        expect(() => assertHTMLElement(null)).toThrow('Expected an HTMLElement, but got: null');
    });

    test('throws for undefined', () => {
        expect(() => assertHTMLElement(undefined)).toThrow('Expected an HTMLElement, but got: undefined');
    });

    test('throws for a plain object', () => {
        expect(() => assertHTMLElement({})).toThrow('Expected an HTMLElement');
    });

    test('throws for a string', () => {
        expect(() => assertHTMLElement('hello')).toThrow('Expected an HTMLElement');
    });

    test('throws for a number', () => {
        expect(() => assertHTMLElement(42)).toThrow('Expected an HTMLElement');
    });
});

describe('assertHTMLInputElement', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="div"></div>
            <input id="input" />
            <select id="select"></select>
        `;
    });

    test('passes through and returns an HTMLInputElement', () => {
        const input = document.getElementById('input');
        const result = assertHTMLInputElement(input);
        expect(result).toBe(input);
    });

    test('throws for a plain HTMLElement (div)', () => {
        const div = document.getElementById('div');
        expect(() => assertHTMLInputElement(div)).toThrow('Expected an HTMLInputElement, but got: ' + div);
    });

    test('throws for an HTMLSelectElement', () => {
        const select = document.getElementById('select');
        expect(() => assertHTMLInputElement(select)).toThrow('Expected an HTMLInputElement, but got: ' + select);
    });

    test('throws for null', () => {
        expect(() => assertHTMLInputElement(null)).toThrow('Expected an HTMLInputElement, but got: null');
    });

    test('throws for undefined', () => {
        expect(() => assertHTMLInputElement(undefined)).toThrow('Expected an HTMLInputElement, but got: undefined');
    });
});

describe('assertHTMLSelectElement', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="div"></div>
            <input id="input" />
            <select id="select"></select>
        `;
    });

    test('passes through and returns an HTMLSelectElement', () => {
        const select = document.getElementById('select');
        const result = assertHTMLSelectElement(select);
        expect(result).toBe(select);
    });

    test('throws for a plain HTMLElement (div)', () => {
        const div = document.getElementById('div');
        expect(() => assertHTMLSelectElement(div)).toThrow('Expected an HTMLSelectElement, but got: ' + div);
    });

    test('throws for an HTMLInputElement', () => {
        const input = document.getElementById('input');
        expect(() => assertHTMLSelectElement(input)).toThrow('Expected an HTMLSelectElement, but got: ' + input);
    });

    test('throws for null', () => {
        expect(() => assertHTMLSelectElement(null)).toThrow('Expected an HTMLSelectElement, but got: null');
    });

    test('throws for undefined', () => {
        expect(() => assertHTMLSelectElement(undefined)).toThrow('Expected an HTMLSelectElement, but got: undefined');
    });
});
