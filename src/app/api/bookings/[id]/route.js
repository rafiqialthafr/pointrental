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

export async function GET(req, context) {
    try {
        const { id } = await context.params;

        const online = await isSupabaseOnline();
        if (online) {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (!error && data) return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
            } catch (dbErr) { }
        }

        const localBookings = getLocalBookings();
        const found = localBookings.find(b => b.id === id || b.midtransOrderId === id);
        if (found) return NextResponse.json(found, { headers: NO_CACHE_HEADERS });

        return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    } catch (err) {
        return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }
}

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        let updatedBooking = null;

        const online = await isSupabaseOnline();
        if (online) {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .update({ ...body, updatedAt: new Date().toISOString() })
                    .eq('id', id)
                    .select()
                    .single();

                if (!error && data) {
                    updatedBooking = data;
                }
            } catch (dbErr) {
                console.warn('[Supabase PATCH Warning]', dbErr.message);
            }
        }

        const localBookings = getLocalBookings();
        const index = localBookings.findIndex(b => b.id === id || b.midtransOrderId === id);

        if (index !== -1) {
            localBookings[index] = {
                ...localBookings[index],
                ...body,
                updatedAt: new Date().toISOString()
            };
            updatedBooking = localBookings[index];
            saveLocalBookings(localBookings);
        } else {
            updatedBooking = { id, ...body, updatedAt: new Date().toISOString() };
            localBookings.unshift(updatedBooking);
            saveLocalBookings(localBookings);
        }

        return NextResponse.json({ success: true, booking: updatedBooking }, { headers: NO_CACHE_HEADERS });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;

        const online = await isSupabaseOnline();
        if (online) {
            try {
                await supabase
                    .from('bookings')
                    .delete()
                    .eq('id', id);
            } catch (dbErr) {
                console.warn('[Supabase DELETE Warning]', dbErr.message);
            }
        }

        const localBookings = getLocalBookings();
        const filtered = localBookings.filter(b => b.id !== id && b.midtransOrderId !== id);
        saveLocalBookings(filtered);

        return NextResponse.json({ success: true, message: 'Booking deleted successfully' }, { headers: NO_CACHE_HEADERS });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}


