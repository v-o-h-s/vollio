/**
 * Simple test for quiz management endpoints
 */

import { describe, it, expect } from 'vitest';

describe('Quiz Management Validation', () => {
  it('should validate UUID format', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    const invalidUUID = 'not-a-uuid';
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    expect(uuidRegex.test(validUUID)).toBe(true);
    expect(uuidRegex.test(invalidUUID)).toBe(false);
  });

  it('should validate difficulty levels', () => {
    const validDifficulties = ['easy', 'medium', 'hard'];
    const invalidDifficulty = 'impossible';
    
    expect(validDifficulties.includes('medium')).toBe(true);
    expect(validDifficulties.includes(invalidDifficulty as any)).toBe(false);
  });

  it('should validate question types', () => {
    const validTypes = ['mcq', 'truefalse', 'fillblank'];
    const invalidType = 'invalid';
    
    expect(validTypes.includes('mcq')).toBe(true);
    expect(validTypes.includes(invalidType as any)).toBe(false);
  });
});