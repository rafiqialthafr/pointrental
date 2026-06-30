import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const body = await request.json();

        const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-XXXXXXXXXXXXXXXXX';

        // 1. Verifikasi Keaslian Webhook
        const generatedSignature = crypto
            .createHash('sha512')
            .update(body.order_id + body.status_code + body.gross_amount + serverKey)
            .digest('hex');

        if (body.signature_key !== generatedSignature) {
            return NextResponse.json({ error: 'Akses Ditolak: Invalid Signature!' }, { status: 400 });
        }

        // 2. Baca Status Transaksi
        const { order_id, transaction_status, fraud_status } = body;
        let statusToUpdate = 'PENDING_PAYMENT';

        if (transaction_status == 'capture') {
            statusToUpdate = fraud_status == 'accept' ? 'PAID' : 'CHALLENGE';
        } else if (transaction_status == 'settlement') {
            statusToUpdate = 'PAID';
        } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
            statusToUpdate = 'FAILED';
        } else if (transaction_status == 'pending') {
            statusToUpdate = 'PENDING_PAYMENT';
        }

        // 3. Format Payment Type
        let formattedPaymentMethod = body.payment_type || 'MIDTRANS';
        if (body.payment_type === 'bank_transfer') {
            const bank = body.va_numbers?.[0]?.bank || 'BANK';
            formattedPaymentMethod = `${bank.toUpperCase()} VA`;
        } else if (body.payment_type === 'echannel') {
            formattedPaymentMethod = 'MANDIRI VA';
        } else if (['qris', 'gopay', 'shopeepay'].includes(body.payment_type)) {
            formattedPaymentMethod = body.payment_type.toUpperCase();
        } else {
            formattedPaymentMethod = formattedPaymentMethod.replace('_', ' ').toUpperCase();
        }

        console.log(`[Webhook] Order: ${order_id} → ${statusToUpdate} via ${formattedPaymentMethod}`);

        // 4. Update Supabase langsung
        const { error } = await supabase
            .from('bookings')
            .update({
                status: statusToUpdate,
                paymentType: formattedPaymentMethod,
                updatedAt: new Date().toISOString()
            })
            .eq('midtransOrderId', order_id);

        if (error) {
            console.error('[Webhook] Supabase update error:', error);
        }

        return NextResponse.json({ success: true, statusUpdated: statusToUpdate }, { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
