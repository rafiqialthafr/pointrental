import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        const newBooking = {
            id: `INV-${Date.now()}`,
            ...body,
            status: 'PAID',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const { error } = await supabase
            .from('bookings')
            .insert([newBooking]);

        if (error) throw error;

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
