import { NextResponse } from 'next/server';
import { supabase, isSupabaseOnline } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
};

const jsonPath = path.join(process.cwd(), 'src', 'data', 'rentals.json');

function getLocalBookings() {
    try {
        if (fs.existsSync(jsonPath)) {
            const raw = fs.readFileSync(jsonPath, 'utf8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) return data;
        }
    } catch (e) {
        console.error('Error reading rentals.json:', e.message);
    }
    return [];
}

function saveLocalBookings(bookings) {
    try {
        fs.writeFileSync(jsonPath, JSON.stringify(bookings, null, 2), 'utf8');
    } catch (e) {
        console.error('Error writing rentals.json:', e.message);
    }
}

export async function GET() {
    const online = await isSupabaseOnline();
    if (online) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('createdAt', { ascending: false });

            if (!error && data) {
                return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
            }
            if (error) {
                console.error('[Supabase GET Error]', error.message);
            }
        } catch (err) {
            console.warn('[Supabase GET Bookings Warning]', err.message);
        }
    }

    const localBookings = getLocalBookings();
    return NextResponse.json(localBookings, { headers: NO_CACHE_HEADERS });
}

export async function POST(req) {
    try {
        const body = await req.json();

        const newBooking = {
            id: `INV-${Date.now()}`,
            ...body,
            status: body.status || 'PENDING_PAYMENT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const online = await isSupabaseOnline();
        if (online) {
            try {
                const { error } = await supabase
                    .from('bookings')
                    .insert([newBooking]);

                if (error) {
                    console.error('[Supabase Insert Error]', error.message);
                }
            } catch (dbErr) {
                console.warn('[Supabase Unreachable - Using Local Storage]', dbErr.message);
            }
        }

        // Save to rentals.json file permanently (when running locally)
        const currentLocal = getLocalBookings();
        currentLocal.unshift(newBooking);
        saveLocalBookings(currentLocal);

        return NextResponse.json({ success: true, booking: newBooking }, { headers: NO_CACHE_HEADERS });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const online = await isSupabaseOnline();
        if (online) {
            try {
                await supabase
                    .from('bookings')
                    .delete()
                    .neq('id', 'CLEAR_ALL_DUMMY_NEQ');
            } catch (dbErr) {
                console.warn('[Supabase DELETE ALL Warning]', dbErr.message);
            }
        }

        saveLocalBookings([]);
        return NextResponse.json({ success: true, message: 'All bookings deleted successfully' }, { headers: NO_CACHE_HEADERS });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


