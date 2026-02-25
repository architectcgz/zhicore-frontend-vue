import { describe, it, expect } from 'vitest';
import * as yup from 'yup';

/**
 * 密码验证单元测试
 * 测试密码验证正则表达式的语法正确性和边界情况
 * 
 * Requirements: 2.1, 2.2, 3.6
 */

// 从 Register.vue 中提取的密码验证 schema
const passwordValidationSchema = yup
  .string()
  .required('请输入密码')
  .min(8, '密码至少8个字符')
  .max(128, '密码不能超过128个字符')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=#+\-_.,;:'"<>()\[\]{}|/\\~])[A-Za-z\d@$!%*?&=#+\-_.,;:'"<>()\[\]{}|/\\~]+$/,
    '密码必须包含大小写字母、数字和特殊字符'
  );

describe('Password Validation - Regex Syntax', () => {
  describe('Valid passwords that meet all requirements', () => {
    it('should accept password with all character types (8 chars)', async () => {
      const password = 'Test@123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with equals sign', async () => {
      const password = 'Test=123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with hash symbol', async () => {
      const password = 'Test#123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with plus sign', async () => {
      const password = 'Test+123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with hyphen', async () => {
      const password = 'Test-123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with underscore', async () => {
      const password = 'Test_123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with period', async () => {
      const password = 'Test.123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with comma', async () => {
      const password = 'Test,123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with semicolon', async () => {
      const password = 'Test;123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with colon', async () => {
      const password = 'Test:123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with single quote', async () => {
      const password = "Test'123";
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with double quote', async () => {
      const password = 'Test"123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with angle brackets', async () => {
      const password = 'Test<123>';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with parentheses', async () => {
      const password = 'Test(123)';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with square brackets', async () => {
      const password = 'Test[123]';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with curly braces', async () => {
      const password = 'Test{123}';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with pipe', async () => {
      const password = 'Test|123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with forward slash', async () => {
      const password = 'Test/123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with backslash', async () => {
      const password = 'Test\\123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with tilde', async () => {
      const password = 'Test~123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with multiple special characters', async () => {
      const password = 'Test@#$123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept longer password (20 chars)', async () => {
      const password = 'Test@123AbcDefGhiJk';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should accept password with all extended special characters', async () => {
      const password = 'Abc123@$!%*?&=#+';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });
  });

  describe('Invalid passwords that should be rejected', () => {
    it('should reject password without uppercase letter', async () => {
      const password = 'test@123';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });

    it('should reject password without lowercase letter', async () => {
      const password = 'TEST@123';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });

    it('should reject password without number', async () => {
      const password = 'Test@Abc';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });

    it('should reject password without special character', async () => {
      const password = 'Test1234';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });

    it('should reject password with only letters', async () => {
      const password = 'TestAbcd';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });

    it('should reject password with only numbers', async () => {
      const password = '12345678';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });

    it('should reject password with unsupported special character (space)', async () => {
      const password = 'Test 123';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });

    it('should reject password with unsupported special character (tab)', async () => {
      const password = 'Test\t123';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码必须包含大小写字母、数字和特殊字符');
    });
  });

  describe('Boundary conditions - Length', () => {
    it('should accept password at minimum length (8 chars)', async () => {
      const password = 'Test@123';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should reject password below minimum length (7 chars)', async () => {
      const password = 'Test@12';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码至少8个字符');
    });

    it('should accept password at maximum length (128 chars)', async () => {
      // Create a 128-character password with all required character types
      const password = 'A1@' + 'a'.repeat(125);
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should reject password above maximum length (129 chars)', async () => {
      // Create a 129-character password
      const password = 'A1@' + 'a'.repeat(126);
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('密码不能超过128个字符');
    });

    it('should reject empty password', async () => {
      const password = '';
      await expect(passwordValidationSchema.validate(password)).rejects.toThrow('请输入密码');
    });
  });

  describe('Regex syntax correctness - Quantifier test', () => {
    it('should match entire password string (not just first character)', async () => {
      // This tests that the regex has proper quantifiers (+) and end anchor ($)
      const password = 'Test@123456789';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should validate complete password with multiple characters of each type', async () => {
      const password = 'TestTEST@@123456';
      await expect(passwordValidationSchema.validate(password)).resolves.toBe(password);
    });

    it('should properly validate password with special chars at different positions', async () => {
      const passwords = [
        '@Test123',  // special at start
        'Test@123',  // special in middle
        'Test123@',  // special at end
      ];
      
      for (const pwd of passwords) {
        await expect(passwordValidationSchema.validate(pwd)).resolves.toBe(pwd);
      }
    });
  });
});

describe('Password Strength Checks - hasSpecial regex', () => {
  // Test the hasSpecial regex pattern used in passwordChecks
  const hasSpecialRegex = /[@$!%*?&=#+\-_.,;:'"<>()\[\]{}|/\\~]/;

  describe('Should recognize all extended special characters', () => {
    const specialChars = '@$!%*?&=#+\\-_.,;:\'"<>()[]{}|/\\~'.split('');
    
    specialChars.forEach((char) => {
      it(`should recognize '${char}' as special character`, () => {
        expect(hasSpecialRegex.test(char)).toBe(true);
      });
    });
  });

  describe('Should recognize special characters in password context', () => {
    it('should recognize equals sign in password', () => {
      expect(hasSpecialRegex.test('Test=123')).toBe(true);
    });

    it('should recognize hash in password', () => {
      expect(hasSpecialRegex.test('Test#123')).toBe(true);
    });

    it('should recognize plus in password', () => {
      expect(hasSpecialRegex.test('Test+123')).toBe(true);
    });

    it('should not recognize password without special characters', () => {
      expect(hasSpecialRegex.test('Test123')).toBe(false);
    });

    it('should not recognize space as special character', () => {
      expect(hasSpecialRegex.test('Test 123')).toBe(false);
    });
  });
});
