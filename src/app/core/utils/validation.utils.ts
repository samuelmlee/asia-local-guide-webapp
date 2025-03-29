/**
 * Validates that all properties of the provided object are not null or undefined
 * @param data Object to validate
 * @param requiredFields Optional array of field names that must be present
 * @returns void, throws Error if validation fails
 */
export function validateModel<T extends object>(
  data: T,
  requiredFields?: (keyof T)[],
): void {
  // Check all properties if requiredFields not specified
  const fieldsToCheck = requiredFields || (Object.keys(data) as (keyof T)[]);

  const invalidProperties = fieldsToCheck.filter(
    (key) => data[key] === null || data[key] === undefined,
  );

  if (invalidProperties.length > 0) {
    throw new Error(
      `Validation failed. Missing or invalid properties: ${invalidProperties.join(', ')}`,
    );
  }
}
