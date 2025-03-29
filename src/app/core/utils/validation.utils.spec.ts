import { ValidationUtils } from './validation.utils';

describe('ValidationUtils', () => {
  describe('ValidationUtils.validateModel', () => {
    // Test basic validation
    it('should not throw when all properties have values', () => {
      const validObject = { name: 'Test', age: 30, active: true };

      expect(() => ValidationUtils.validateModel(validObject)).not.toThrow();
    });

    it('should throw when a property is null', () => {
      const invalidObject = { name: 'Test', age: null, active: true };

      expect(() => ValidationUtils.validateModel(invalidObject)).toThrow();
      expect(() => ValidationUtils.validateModel(invalidObject)).toThrowError(
        /age/
      );
    });

    it('should throw when a property is undefined', () => {
      const invalidObject = { name: 'Test', age: undefined, active: true };

      expect(() => ValidationUtils.validateModel(invalidObject)).toThrow();
      expect(() => ValidationUtils.validateModel(invalidObject)).toThrowError(
        /age/
      );
    });

    // Test with requiredFields parameter
    it('should validate only the specified fields when requiredFields is provided', () => {
      const partialObject = { name: 'Test', age: null, active: true };
      const requiredFields: (keyof typeof partialObject)[] = ['name', 'active'];

      expect(() =>
        ValidationUtils.validateModel(partialObject, requiredFields)
      ).not.toThrow();
    });

    it('should throw when a specified required field is null', () => {
      const partialObject = { name: 'Test', age: null, active: true };
      const requiredFields: (keyof typeof partialObject)[] = ['name', 'age'];

      expect(() =>
        ValidationUtils.validateModel(partialObject, requiredFields)
      ).toThrow();
      expect(() =>
        ValidationUtils.validateModel(partialObject, requiredFields)
      ).toThrowError(/age/);
    });

    it('should throw when a specified required field is undefined', () => {
      const partialObject = { name: 'Test', age: undefined, active: true };
      const requiredFields: (keyof typeof partialObject)[] = ['age'];

      expect(() =>
        ValidationUtils.validateModel(partialObject, requiredFields)
      ).toThrow();
      expect(() =>
        ValidationUtils.validateModel(partialObject, requiredFields)
      ).toThrowError(/age/);
    });

    // Test error message format
    it('should include all invalid property names in the error message', () => {
      const invalidObject = { name: null, age: undefined, active: true };

      expect(() => ValidationUtils.validateModel(invalidObject)).toThrowError(
        /name.*age/
      );
    });

    // Test edge cases
    it('should not throw for empty objects', () => {
      const emptyObject = {};

      expect(() => ValidationUtils.validateModel(emptyObject)).not.toThrow();
    });

    it('should not throw for falsy values that are valid (0, false, empty string)', () => {
      const validObject = { count: 0, active: false, name: '' };

      expect(() => ValidationUtils.validateModel(validObject)).not.toThrow();
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
      expect(() =>
        ValidationUtils.validateModel(nestedObject, requiredFields)
      ).not.toThrow();
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

      expect(() => ValidationUtils.validateModel(instance)).not.toThrow();
    });

    it('should handle objects with mixed valid and invalid properties', () => {
      const mixedObject = {
        id: 1,
        name: 'Test',
        description: null,
        tags: ['a', 'b'],
        status: undefined,
      };

      expect(() => ValidationUtils.validateModel(mixedObject)).toThrow();
      expect(() => ValidationUtils.validateModel(mixedObject)).toThrowError();
    });
  });
});
