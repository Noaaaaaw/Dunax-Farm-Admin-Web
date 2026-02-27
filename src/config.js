import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const CONFIG = {
  BASE_URL: 'http://103.171.85.57:5000',
  SUPABASE_URL: 'https://cdhpijazjuuvujxlhigq.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkaHBpamF6anV1dnVqeGxoaWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODQzMTgsImV4cCI6MjA4NTM2MDMxOH0.iSldvMGaUauu_SoxnbuzF83YvP8ikDaePi-_g15Q33g'
};

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);