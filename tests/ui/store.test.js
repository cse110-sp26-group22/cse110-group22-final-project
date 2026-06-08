import Store, { store } from '../../src/final/js/ui/store.js';

describe('Store', () => {
    /** @type {Store} */
    let storeInstance;

    beforeEach(() => {
        storeInstance = new Store();
    });

    test('initializes with empty data', () => {
        expect(storeInstance.data).toEqual({});
    });

    test('retrieve returns undefined for unset properties', () => {
        expect(storeInstance.retrieve('nonexistent')).toBeUndefined();
    });

    test('update sets the property value in data', () => {
        storeInstance.update('score', 100);
        expect(storeInstance.data.score).toBe(100);
    });

    test('retrieve returns the value after update', () => {
        storeInstance.update('score', 100);
        expect(storeInstance.retrieve('score')).toBe(100);
    });

    test('retrieve returns updated value after multiple updates', () => {
        storeInstance.update('score', 100);
        storeInstance.update('score', 200);
        expect(storeInstance.retrieve('score')).toBe(200);
    });

    test('subscribe callback is called with the new value on update', () => {
        const callback = jest.fn();
        storeInstance.subscribe('combo', callback);
        storeInstance.update('combo', 3);
        expect(callback).toHaveBeenCalledWith(3);
    });

    test('subscribe callback is called on every update', () => {
        const callback = jest.fn();
        storeInstance.subscribe('combo', callback);
        storeInstance.update('combo', 3);
        storeInstance.update('combo', 2);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith(2);
    });

    test('subscribing to one property does not trigger callbacks for other properties', () => {
        const callback = jest.fn();
        storeInstance.subscribe('lives', callback);
        storeInstance.update('combo', 3);
        expect(callback).not.toHaveBeenCalled();
    });

    test('multiple subscribers on the same property are all called', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        storeInstance.subscribe('timer', callback1);
        storeInstance.subscribe('timer', callback2);
        storeInstance.update('timer', 30);
        expect(callback1).toHaveBeenCalledWith(30);
        expect(callback2).toHaveBeenCalledWith(30);
    });

    test('updating with different data types works correctly', () => {
        const callback = jest.fn();
        storeInstance.subscribe('data', callback);

        storeInstance.update('data', 'string value');
        expect(callback).toHaveBeenCalledWith('string value');

        storeInstance.update('data', 42);
        expect(callback).toHaveBeenCalledWith(42);

        const obj = { key: 'value' };
        storeInstance.update('data', obj);
        expect(callback).toHaveBeenCalledWith(obj);

        const arr = [1, 2, 3];
        storeInstance.update('data', arr);
        expect(callback).toHaveBeenCalledWith(arr);

        storeInstance.update('data', null);
        expect(callback).toHaveBeenCalledWith(null);
    });

    test('singleton store is an instance of Store', () => {
        expect(store).toBeInstanceOf(Store);
    });

    test('singleton store shares state across imports', () => {
        store.update('shared', 'value');
        expect(store.retrieve('shared')).toBe('value');
    });
});
