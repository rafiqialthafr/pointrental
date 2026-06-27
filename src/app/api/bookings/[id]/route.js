import { NextResponse } from 'next/server';
import { getBookings, saveBookings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        const bookings = getBookings();
        const booking = bookings.find(b => b.id === params.id);
        if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(booking);
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const bookings = getBookings();
        const index = bookings.findIndex(b => b.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        bookings[index] = { ...bookings[index], ...body, updatedAt: new Date().toISOString() };
        saveBookings(bookings);

        return NextResponse.json({ success: true, booking: bookings[index] });
    } catch (err) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
