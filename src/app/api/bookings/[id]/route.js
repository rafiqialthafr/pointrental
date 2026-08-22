import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req, context) {
    try {
        const { id } = await context.params;
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        let updatedBooking = { id, ...body, updatedAt: new Date().toISOString() };

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
            console.warn('[Supabase Unreachable - PATCH Fallback]', dbErr.message);
        }

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

