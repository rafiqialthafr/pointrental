import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eznxgugulebxogvflnww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bnhndWd1bGVieG9ndmZsbnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjYyNzgsImV4cCI6MjA5ODEwMjI3OH0.n5GD5hGlFWCOS0VCxXe_E5ooGIojmeCdFaMSVuMWqFE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    try {
        const bookingsRes = await supabase.from('bookings').select('*').limit(3);
        console.log('Bookings table:', bookingsRes.error ? bookingsRes.error.message : `OK (${bookingsRes.data?.length} rows)`);

        const carsRes = await supabase.from('cars').select('*').limit(3);
        console.log('Cars table:', carsRes.error ? carsRes.error.message : `OK (${carsRes.data?.length} rows)`);

        const ratingsRes = await supabase.from('ratings').select('*').limit(3);
        console.log('Ratings table:', ratingsRes.error ? ratingsRes.error.message : `OK (${ratingsRes.data?.length} rows)`);
    } catch (e) {
        console.error('Test error:', e);
    }
}

test();
