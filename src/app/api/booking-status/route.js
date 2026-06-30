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

        // Cari berdasarkan midtransOrderId (format: BOOK-XXXXX)
        const { data, error } = await supabase
            .from('bookings')
            .select('id, status, midtransOrderId, paymentType, updatedAt')
            .eq('midtransOrderId', orderId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 });
        }

        let currentStatus = data.status;

        // [Mekanisme Fallback untuk Localhost/Sandbox]
        // Jika di DB masih PENDING_PAYMENT, cek manual ke Midtrans Core API.
        // Ini memastikan statusnya ter-update jika Webhook gagal terkirim (karena kita pakai localhost).
        if (currentStatus === 'PENDING_PAYMENT') {
            const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
            const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
            const statusRes = await fetch(
                `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
                { headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' } }
            );

            if (statusRes.ok) {
                const statusData = await statusRes.json();
                if (statusData.transaction_status === 'settlement' || statusData.transaction_status === 'capture') {
                    // Update ke database bahwa sudah dibayar!
                    currentStatus = 'PAID';
                    await supabase
                        .from('bookings')
                        .update({ status: 'PAID', updatedAt: new Date().toISOString() })
                        .eq('midtransOrderId', orderId);

                    console.log(`[Polling-Sync] Status disinkronkan ke PAID untuk order: ${orderId}`);
                }
            }
        }

        return NextResponse.json({ status: currentStatus, paymentType: data.paymentType });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
