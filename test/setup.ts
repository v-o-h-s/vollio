// Test setup file for vitest
import { vi } from 'vitest';

// Mock environment variables
process.env.DEEPSEEK_AP_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock fetch globally
global.fetch = vi.fn();