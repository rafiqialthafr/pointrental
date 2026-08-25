import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Flag: apakah Supabase bisa diakses?
let _isOnline = null; // null = belum dicek, true/false = sudah dicek

const isValidConfig = supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder');

// Buat client (atau dummy jika config kosong)
export const supabase = isValidConfig
    ? createClient(supabaseUrl, supabaseKey)
    : createClient('https://placeholder.supabase.co', 'placeholder');

// Cek koneksi Supabase SEKALI saja dengan query ringan
async function checkOnline() {
    if (_isOnline !== null) return _isOnline;
    if (!isValidConfig) { _isOnline = false; return false; }

    try {
        const { error } = await supabase.from('bookings').select('id').limit(1);
        _isOnline = !error;
    } catch (e) {
        _isOnline = false;
    }
    console.log(`[Supabase] Online check: ${_isOnline ? 'CONNECTED ✅' : 'OFFLINE ❌ → using rentals.json'}`);
    return _isOnline;
}

// Export helper: true jika Supabase bisa dipakai
export async function isSupabaseOnline() {
    return checkOnline();
}
