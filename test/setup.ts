// Test setup file for vitest
import { vi } from 'vitest';

// Mock environment variables
process.env.DEEPSEEK_AP_KEY = 'test-api-key';

// Mock fetch globally
global.fetch = vi.fn();