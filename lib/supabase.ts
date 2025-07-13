import { createClient as createClientBase } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Server-side Supabase client (for use in Server Components and Route Handlers)
export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

// Admin client for privileged operations (only use in trusted server contexts)
export const createAdminClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClientBase<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
};

// Client-side Supabase client (for use in Client Components)
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name: string, value: string, options: any) {
          let cookie = `${name}=${value}`;
          if (options.maxAge) {
            cookie += `; Max-Age=${options.maxAge}`;
          }
          if (options.path) {
            cookie += `; Path=${options.path}`;
          }
          if (options.sameSite) {
            cookie += `; SameSite=${options.sameSite}`;
          }
          if (options.secure) {
            cookie += '; Secure';
          }
          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; Max-Age=0; Path=${options.path || '/'}`;
        },
      },
    }
  );
};

// Singleton pattern for client-side to avoid multiple instances
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | undefined;

// Get the browser client (singleton pattern)
export const getBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  return browserClient;
};

// Helper function to validate ABN (Australian Business Number)
export const validateABN = async (abn: string) => {
  // Remove spaces and other non-digit characters
  const cleanAbn = abn.replace(/[^0-9]/g, '');
  
  // ABN must be 11 digits
  if (cleanAbn.length !== 11) {
    return false;
  }
  
  // ABN validation algorithm
  // Subtract 1 from the first digit
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;
  
  // First digit is weighted differently
  sum += (parseInt(cleanAbn[0]) - 1) * weights[0];
  
  // Add the rest of the weighted digits
  for (let i = 1; i < 11; i++) {
    sum += parseInt(cleanAbn[i]) * weights[i];
  }
  
  // Valid ABN must be divisible by 89
  return sum % 89 === 0;
};

// Australian GST calculation helpers
export const calculateGST = (amount: number) => {
  const gstRate = 0.1; // 10% GST in Australia
  return amount * gstRate;
};

export const addGST = (amountExGST: number) => {
  return amountExGST + calculateGST(amountExGST);
};

export const removeGST = (amountIncGST: number) => {
  return amountIncGST / 1.1;
};

// Format ABN with spaces (XX XXX XXX XXX)
export const formatABN = (abn: string) => {
  const cleanAbn = abn.replace(/[^0-9]/g, '');
  if (cleanAbn.length !== 11) return abn;
  
  return `${cleanAbn.substring(0, 2)} ${cleanAbn.substring(2, 5)} ${cleanAbn.substring(5, 8)} ${cleanAbn.substring(8, 11)}`;
};
