import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const fallbackBookings = [];

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error || !data) return NextResponse.json(fallbackBookings);
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(fallbackBookings);
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        const newBooking = {
            id: `INV-${Date.now()}`,
            ...body,
            status: 'PENDING_PAYMENT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const { error } = await supabase
                .from('bookings')
                .insert([newBooking]);

            if (error) {
                console.warn('[Supabase Insert Warning]', error.message);
            }
        } catch (dbErr) {
            console.warn('[Supabase Unreachable - Using Fallback]', dbErr.message);
        }

        fallbackBookings.unshift(newBooking);

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

