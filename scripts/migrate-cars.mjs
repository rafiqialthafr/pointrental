import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const SUPABASE_URL = 'https://eznxgugulebxogvflnww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bnhndWd1bGVieG9ndmZsbnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjYyNzgsImV4cCI6MjA5ODEwMjI3OH0.n5GD5hGlFWCOS0VCxXe_E5ooGIojmeCdFaMSVuMWqFE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateCars() {
    try {
        const carsPath = join(projectRoot, 'src/data/cars.json');
        const carsRaw = readFileSync(carsPath, 'utf8');
        const cars = JSON.parse(carsRaw);
        console.log(`📦 Ditemukan ${cars.length} armada mobil di cars.json...`);

        // Check existing in Supabase
        const { data: existing } = await supabase.from('cars').select('id');
        const existingIds = new Set((existing || []).map(c => c.id));
        console.log(`☁️  Supabase saat ini punya ${existingIds.size} armada mobil.`);

        const toInsert = cars.filter(c => !existingIds.has(c.id)).map(c => ({
            ...c,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));

        if (toInsert.length === 0) {
            console.log('✅ Semua mobil sudah ada di Supabase!');
            return;
        }

        console.log(`➕ Mengunggah ${toInsert.length} armada mobil ke Supabase...`);
        const { data, error } = await supabase.from('cars').insert(toInsert).select();

        if (error) {
            console.error('❌ Error saat insert ke tabel cars:', error.message);
        } else {
            console.log(`🎉 Berhasil memigrasikan ${data.length} armada mobil ke Supabase!`);
        }

        const { count } = await supabase.from('cars').select('*', { count: 'exact', head: true });
        console.log(`📊 Total armada di Supabase sekarang: ${count}`);
    } catch (err) {
        console.error('❌ FATAL ERROR:', err.message);
    }
}

migrateCars();
