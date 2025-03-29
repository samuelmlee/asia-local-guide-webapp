import { validateModel } from './validation.utils';

describe('validation.utils', () => {
  describe('validateModel', () => {
    // Test basic validation
    it('should not throw when all properties have values', () => {
      const validObject = { name: 'Test', age: 30, active: true };

      expect(() => validateModel(validObject)).not.toThrow();
    });

    it('should throw when a property is null', () => {
      const invalidObject = { name: 'Test', age: null, active: true };

      expect(() => validateModel(invalidObject)).toThrow();
      expect(() => validateModel(invalidObject)).toThrowError(/age/);
    });

    it('should throw when a property is undefined', () => {
      const invalidObject = { name: 'Test', age: undefined, active: true };

      expect(() => validateModel(invalidObject)).toThrow();
      expect(() => validateModel(invalidObject)).toThrowError(/age/);
    });

    // Test with requiredFields parameter
    it('should validate only the specified fields when requiredFields is provided', () => {
      const partialObject = { name: 'Test', age: null, active: true };
      const requiredFields: (keyof typeof partialObject)[] = ['name', 'active'];

      expect(() => validateModel(partialObject, requiredFields)).not.toThrow();
    });

    it('should throw when a specified required field is null', () => {
      const partialObject = { name: 'Test', age: null, active: true };
      const requiredFields: (keyof typeof partialObject)[] = ['name', 'age'];

      expect(() => validateModel(partialObject, requiredFields)).toThrow();
      expect(() => validateModel(partialObject, requiredFields)).toThrowError(
        /age/
      );
    });

    it('should throw when a specified required field is undefined', () => {
      const partialObject = { name: 'Test', age: undefined, active: true };
      const requiredFields: (keyof typeof partialObject)[] = ['age'];

      expect(() => validateModel(partialObject, requiredFields)).toThrow();
      expect(() => validateModel(partialObject, requiredFields)).toThrowError(
        /age/
      );
    });

    // Test error message format
    it('should include all invalid property names in the error message', () => {
      const invalidObject = { name: null, age: undefined, active: true };

      expect(() => validateModel(invalidObject)).toThrowError(/name.*age/);
    });

    // Test edge cases
    it('should not throw for empty objects', () => {
      const emptyObject = {};

      expect(() => validateModel(emptyObject)).not.toThrow();
    });

    it('should not throw for falsy values that are valid (0, false, empty string)', () => {
      const validObject = { count: 0, active: false, name: '' };

      expect(() => validateModel(validObject)).not.toThrow();
    });

    it('should validate nested objects when specified', () => {
      const nestedObject = {
        user: {
          name: 'Test',
          details: null,
        },
      };
      const requiredFields: (keyof typeof nestedObject)[] = ['user'];

      // Should not throw because 'user' exists, even though user.details is null
      expect(() => validateModel(nestedObject, requiredFields)).not.toThrow();
    });

    it('should handle objects with getter properties', () => {
      class TestClass {
        private readonly _name = 'Test';

        get name(): string {
          return this._name;
        }

        get computedValue(): string {
          return this._name.toUpperCase();
        }
      }

      const instance = new TestClass();

      expect(() => validateModel(instance)).not.toThrow();
    });

    it('should handle objects with mixed valid and invalid properties', () => {
      const mixedObject = {
        id: 1,
        name: 'Test',
        description: null,
        tags: ['a', 'b'],
        status: undefined,
      };

      expect(() => validateModel(mixedObject)).toThrow();
      expect(() => validateModel(mixedObject)).toThrowError();
    });
  });
});
