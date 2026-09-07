import { createClient } from '@supabase/supabase-js';

// Ganti teks di bawah ini langsung dengan URL dan Anon Key milikmu dari Supabase
const supabaseUrl = 'https://arvecyzwwxuuxfkzvpmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydmVjeXp3d3h1dXhma3p2cG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTQ4MDYsImV4cCI6MjEwMDA3MDgwNn0.TZAuPhI8cggbAraLmhlDF78yitGhZipJ93-LXhBwt8U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);