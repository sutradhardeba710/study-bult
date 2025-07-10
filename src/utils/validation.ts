export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validateField = (
  value: any,
  fieldName: string,
  rules: ValidationRule
): string | null => {
  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    return `${fieldName} is required.`;
  }

  if (!value) return null;

  const stringValue = value.toString().trim();

  // Min length check
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters long.`;
  }

  // Max length check
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `${fieldName} must be no more than ${rules.maxLength} characters long.`;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return `${fieldName} format is invalid.`;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (
  data: { [key: string]: any },
  rules: { [key: string]: ValidationRule }
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[fieldName], fieldName, fieldRules);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!value.includes('@')) {
        return 'Please enter a valid email address.';
      }
      return null;
    },
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value.length < 6) {
        return 'Password must be at least 6 characters long.';
      }
      return null;
    },
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
};

// File validation
export const validateFile = (file: File, maxSize: number = 10 * 1024 * 1024) => {
  const errors: string[] = [];

  if (file.type !== 'application/pdf') {
    errors.push('Only PDF files are allowed.');
  }

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
  }

  return errors;
}; 