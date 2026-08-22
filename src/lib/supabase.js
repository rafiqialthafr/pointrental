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

// Cek koneksi Supabase SEKALI saja dengan timeout 3 detik
async function checkOnline() {
    if (_isOnline !== null) return _isOnline;
    if (!isValidConfig) { _isOnline = false; return false; }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'HEAD',
            headers: { 'apikey': supabaseKey },
            signal: controller.signal
        });
        clearTimeout(timer);
        _isOnline = res.ok || res.status === 400; // 400 = reachable tapi butuh query
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
