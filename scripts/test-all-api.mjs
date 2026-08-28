import { getCars } from '../src/lib/cars-store.js';
import { supabase } from '../src/lib/supabase.js';

async function testAll() {
    console.log('--- Testing Cars Store ---');
    const cars = await getCars();
    console.log(`Cars loaded from Supabase: ${cars.length} cars found.`);
    if (cars.length > 0) {
        console.log(`Sample car: ${cars[0].brand} ${cars[0].model} (ID: ${cars[0].id})`);
    }

    console.log('\n--- Testing Bookings in Supabase ---');
    const { data: bookings, error: bError } = await supabase.from('bookings').select('id, customerName, status').limit(3);
    if (bError) {
        console.error('Bookings error:', bError.message);
    } else {
        console.log(`Bookings query success: ${bookings.length} bookings found.`);
    }

    console.log('\n--- Testing Ratings in Supabase ---');
    const { data: ratings, error: rError } = await supabase.from('ratings').select('id, name, score').limit(3);
    if (rError) {
        console.error('Ratings error:', rError.message);
    } else {
        console.log(`Ratings query success: ${ratings.length} ratings found.`);
    }
}

testAll();
