// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://muaympduoziavnahxhtt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YXltcGR1b3ppYXZuYWh4aHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzM3NDAsImV4cCI6MjA1OTQwOTc0MH0.80qOZQmFwf7063gL4noAKiiUpDd8q0qEweOV6OL3Oxg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);