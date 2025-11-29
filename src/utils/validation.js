/**
 * Validates email to ensure it follows Gmail format
 * Rules:
 * - Must contain exactly one "@"
 * - Must end with @gmail.com
 * - Must not contain spaces
 * - Local part can contain alphanumeric, dots, underscores, plus/minus signs
 * @param {string} email - Email to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
export const validateGmailEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }

  const trimmedEmail = email.trim();

  // Check for spaces
  if (trimmedEmail.includes(' ')) {
    return 'Email cannot contain spaces';
  }

  // Check for exactly one @
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return 'Email must contain exactly one @';
  }

  // Check if it ends with @gmail.com
  if (!trimmedEmail.endsWith('@gmail.com')) {
    return 'Email must end with @gmail.com';
  }

  // Extract local part (before @)
  const localPart = trimmedEmail.split('@')[0];

  // Validate local part: alphanumeric, dots, underscores, plus/minus signs
  const localPartRegex = /^[a-zA-Z0-9._+-]+$/;
  if (!localPartRegex.test(localPart)) {
    return 'Email contains invalid characters';
  }

  // Local part cannot be empty
  if (localPart.length === 0) {
    return 'Email local part cannot be empty';
  }

  // Local part cannot start or end with a dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Email cannot start or end with a dot';
  }

  // Local part cannot have consecutive dots
  if (localPart.includes('..')) {
    return 'Email cannot have consecutive dots';
  }

  return null; // Valid
};

/**
 * Validates password to ensure it meets strong password requirements
 * Rules:
 * - At least 8 characters long
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (! @ # $ % & * ? + -)
 * - No spaces allowed
 * - Only standard keyboard characters (no emoji or unicode symbols)
 * @param {string} password - Password to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
export const validateStrongPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }

  // Check minimum length
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  // Check for spaces
  if (password.includes(' ')) {
    return 'Password cannot contain spaces';
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z)';
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z)';
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number (0-9)';
  }

  // Check for special character (allowed: ! @ # $ % & * ? + -)
  if (!/[!@#$%&*?+-]/.test(password)) {
    return 'Password must contain at least one special character (! @ # $ % & * ? + -)';
  }

  // Check for only standard keyboard characters (ASCII printable, excluding spaces which we already checked)
  // Allow: A-Z, a-z, 0-9, and special characters ! @ # $ % & * ? + -
  const validCharsRegex = /^[A-Za-z0-9!@#$%&*?+-]+$/;
  if (!validCharsRegex.test(password)) {
    return 'Password can only contain standard keyboard characters';
  }

  return null; // Valid
};

