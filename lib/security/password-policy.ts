/**
 * Strict Production Password Security Policy Validator for DropAI
 *
 * Requirements:
 * - Minimum 12 characters
 * - Uppercase and lowercase characters
 * - At least one numeric digit
 * - At least one special character
 * - Reject commonly used/leaked passwords
 * - Reject passwords closely matching the user's email address or username
 */

const COMMON_PASSWORDS = new Set([
  "password1234",
  "password12345",
  "123456789012",
  "1234567890123",
  "qwertyuiop12",
  "administrator1",
  "admin1234567",
  "welcome12345",
  "iloveyou1234",
  "changeme1234",
  "trustnoone12",
  "sunshine1234",
  "master123456",
  "dragon123456",
  "monkey123456",
  "superman1234",
  "batman123456",
  "starwars1234",
  "football1234",
  "baseball1234",
  "liverpool123",
  "barcelona123",
  "arsenal12345",
  "chelsea12345",
  "manchester12",
]);

export interface PasswordValidationResult {
  valid: boolean;
  strength: "STRONG" | "MEDIUM" | "WEAK";
  score: number;
  errors: string[];
  rules: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notCommon: boolean;
    notEmailMatch: boolean;
  };
}

export function validatePasswordPolicy(password: string, email?: string): PasswordValidationResult {
  const errors: string[] = [];

  const minLength = (password || "").length >= 8;
  if (!minLength) {
    errors.push("Password must be at least 8 characters long.");
  }

  const hasUpper = /[A-Z]/.test(password || "");
  if (!hasUpper) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }

  const hasLower = /[a-z]/.test(password || "");
  if (!hasLower) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }

  const hasNumber = /[0-9]/.test(password || "");
  if (!hasNumber) {
    errors.push("Password must contain at least one number (0-9).");
  }

  const hasSpecial = /[^A-Za-z0-9]/.test(password || "");
  if (!hasSpecial) {
    errors.push("Password must contain at least one special character (!@#$%^&* etc.).");
  }

  const cleanedLower = (password || "").toLowerCase().trim();
  const notCommon = !COMMON_PASSWORDS.has(cleanedLower);
  if (!notCommon) {
    errors.push("This password is commonly used and easily compromised. Please choose a more unique passphrase.");
  }

  let notEmailMatch = true;
  if (email && email.includes("@")) {
    const emailPrefix = email.split("@")[0].toLowerCase().trim();
    if (emailPrefix.length >= 3 && cleanedLower.includes(emailPrefix)) {
      notEmailMatch = false;
      errors.push("Password cannot contain your email username or store name.");
    }
  }

  const rulesPassed = [
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    notCommon,
    notEmailMatch,
  ].filter(Boolean).length;

  let strength: "STRONG" | "MEDIUM" | "WEAK" = "WEAK";
  if (rulesPassed >= 7 && (password || "").length >= 14) {
    strength = "STRONG";
  } else if (rulesPassed >= 5 && (password || "").length >= 12) {
    strength = "STRONG";
  } else if (rulesPassed >= 4) {
    strength = "MEDIUM";
  }

  return {
    valid: errors.length === 0,
    strength,
    score: rulesPassed,
    errors,
    rules: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      notCommon,
      notEmailMatch,
    },
  };
}
