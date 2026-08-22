import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/booking-status?orderId=BOOK-XXXXXXXX
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'orderId diperlukan' }, { status: 400 });
        }

        let currentStatus = 'PENDING_PAYMENT';
        let paymentType = 'MIDTRANS';

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

        // [Mekanisme Fallback untuk Localhost/Sandbox]
        // Jika di DB masih PENDING_PAYMENT, cek manual ke Midtrans Core API.
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
                    if (statusData.transaction_status === 'settlement' || statusData.transaction_status === 'capture') {
                        currentStatus = 'PAID';
                        if (statusData.payment_type) paymentType = statusData.payment_type;
                        try {
                            await supabase
                                .from('bookings')
                                .update({ status: 'PAID', updatedAt: new Date().toISOString() })
                                .eq('midtransOrderId', orderId);
                        } catch (e) { }
                    }
                }
            } catch (midErr) {
                console.warn('[Midtrans Status Check Warning]', midErr.message);
            }
        }

        return NextResponse.json({ status: currentStatus, paymentType });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

