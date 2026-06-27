import { NextResponse } from 'next/server';
import { getBookings, saveBookings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const bookings = getBookings();
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return NextResponse.json(bookings);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const bookings = getBookings();

        const newBooking = {
            id: `INV-${Date.now()}`,
            ...body,
            status: 'PAID',
            createdAt: new Date().toISOString()
        };

        bookings.push(newBooking);
        saveBookings(bookings);

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
