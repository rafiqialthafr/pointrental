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
    } catch (e) { }
    return [];
}

function updateLocalStatus(orderId, newStatus, paymentType) {
    try {
        const bookings = getLocalBookings();
        const index = bookings.findIndex(b => b.midtransOrderId === orderId || b.id === orderId);
        if (index !== -1) {
            bookings[index].status = newStatus;
            if (paymentType) bookings[index].paymentType = paymentType;
            bookings[index].updatedAt = new Date().toISOString();
            fs.writeFileSync(jsonPath, JSON.stringify(bookings, null, 2), 'utf8');
        }
    } catch (e) { }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'orderId diperlukan' }, { status: 400 });
        }

        let currentStatus = 'PENDING_PAYMENT';
        let paymentType = 'MIDTRANS';

        const localBookings = getLocalBookings();
        const foundLocal = localBookings.find(b => b.midtransOrderId === orderId || b.id === orderId);

        if (foundLocal) {
            currentStatus = foundLocal.status;
            if (foundLocal.paymentType) paymentType = foundLocal.paymentType;
        }

        const online = await isSupabaseOnline();
        if (online) {
            try {
                const { data } = await supabase
                    .from('bookings')
                    .select('id, status, midtransOrderId, paymentType, updatedAt')
                    .eq('midtransOrderId', orderId)
                    .single();

                if (data) {
                    currentStatus = data.status;
                    if (data.paymentType) paymentType = data.paymentType;
                }
            } catch (dbErr) {
                console.warn('[Supabase Booking Status Fallback]', dbErr.message);
            }
        }

        if (currentStatus === 'PENDING_PAYMENT') {
            const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
            const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
            try {
                const statusRes = await fetch(
                    `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
                    { headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' } }
                );

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    
                    // Format payment_type jika ada detail bank dari Midtrans
                    if (statusData.payment_type) {
                        if (statusData.payment_type === 'bank_transfer') {
                            const bank = statusData.va_numbers?.[0]?.bank || (statusData.permata_va_number ? 'permata' : 'BANK');
                            paymentType = `${bank.toUpperCase()} VA`;
                        } else if (statusData.payment_type === 'echannel') {
                            paymentType = 'MANDIRI VA';
                        } else if (['qris', 'gopay', 'shopeepay'].includes(statusData.payment_type)) {
                            paymentType = statusData.payment_type.toUpperCase();
                        } else {
                            paymentType = statusData.payment_type.replace('_', ' ').toUpperCase();
                        }
                    }

                    if (statusData.transaction_status === 'settlement' || statusData.transaction_status === 'capture') {
                        currentStatus = 'PAID';

                        updateLocalStatus(orderId, 'PAID', paymentType);

                        if (online) {
                            try {
                                await supabase
                                    .from('bookings')
                                    .update({ status: 'PAID', paymentType: paymentType, updatedAt: new Date().toISOString() })
                                    .eq('midtransOrderId', orderId);
                            } catch (e) { }
                        }
                    }
                }
            } catch (midErr) {
                console.warn('[Midtrans Status Check Warning]', midErr.message);
            }
        }

        return NextResponse.json({ status: currentStatus, paymentType }, { headers: NO_CACHE_HEADERS });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}


