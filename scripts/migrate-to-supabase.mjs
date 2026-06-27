// Script migrasi data bookings.json ke Supabase
// Jalankan dengan: node scripts/migrate-to-supabase.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const SUPABASE_URL = 'https://eznxgugulebxogvflnww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bnhndWd1bGVieG9ndmZsbnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjYyNzgsImV4cCI6MjA5ODEwMjI3OH0.n5GD5hGlFWCOS0VCxXe_E5ooGIojmeCdFaMSVuMWqFE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrate() {
    try {
        // 1. Baca data dari bookings.json
        const bookingsPath = join(projectRoot, 'src/data/bookings.json');
        const bookingsRaw = readFileSync(bookingsPath, 'utf8');
        const bookings = JSON.parse(bookingsRaw);
        console.log(`📦 Ditemukan ${bookings.length} data booking di JSON...`);

        // 2. Cek data yang sudah ada di Supabase (hindari duplikat)
        const { data: existing } = await supabase.from('bookings').select('id');
        const existingIds = new Set((existing || []).map(b => b.id));
        console.log(`☁️  Supabase sudah punya ${existingIds.size} data.`);

        // 3. Filter hanya data yang belum ada
        const toInsert = bookings.filter(b => !existingIds.has(b.id));
        console.log(`➕ Akan dimigrasi: ${toInsert.length} data baru...`);

        if (toInsert.length === 0) {
            console.log('✅ Semua data sudah ada di Supabase! Tidak ada yang perlu dimigrasi.');
            return;
        }

        // 4. Insert ke Supabase (batch max 100 per request)
        const batchSize = 100;
        for (let i = 0; i < toInsert.length; i += batchSize) {
            const batch = toInsert.slice(i, i + batchSize);
            const { error } = await supabase.from('bookings').insert(batch);
            if (error) {
                console.error(`❌ Error saat insert batch ke-${i / batchSize + 1}:`, error.message);
            } else {
                console.log(`✅ Batch ${i / batchSize + 1}: ${batch.length} data berhasil dimigrasi!`);
            }
        }

        console.log('\n🎉 MIGRASI SELESAI! Semua data booking sudah aman di Supabase Cloud.');

        // 5. Cek total data sekarang
        const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        console.log(`📊 Total data di Supabase sekarang: ${count}`);

    } catch (err) {
        console.error('❌ FATAL ERROR:', err.message);
    }
}

migrate();
