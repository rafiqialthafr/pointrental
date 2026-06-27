import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const body = await request.json();

        // Ambil Server Key (Sama dengan di checkout)
        const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-XXXXXXXXXXXXXXXXX';

        // 1. Verifikasi Keaslian Webhook (Security Check)
        // Midtrans mengirimkan signature_key berupa SHA512(order_id + status_code + gross_amount + serverKey)
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
            if (fraud_status == 'challenge') {
                statusToUpdate = 'CHALLENGE';
            } else if (fraud_status == 'accept') {
                statusToUpdate = 'PAID';
            }
        } else if (transaction_status == 'settlement') {
            // Settle = Pembayaran Sukses Diterima
            statusToUpdate = 'PAID';
        } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
            // Gagal / Batal / Kadaluarsa
            statusToUpdate = 'FAILED';
        } else if (transaction_status == 'pending') {
            // Menunggu Pembayaran
            statusToUpdate = 'PENDING_PAYMENT';
        }

        // 3. Update Status ke Database Anda & Format Payment Type
        let formattedPaymentMethod = body.payment_type || 'MIDTRANS';

        if (body.payment_type === 'bank_transfer') {
            const bank = body.va_numbers && body.va_numbers[0] ? body.va_numbers[0].bank : 'BANK';
            formattedPaymentMethod = `${bank.toUpperCase()} VA`;
        } else if (body.payment_type === 'echannel') {
            formattedPaymentMethod = 'MANDIRI VA';
        } else if (body.payment_type === 'qris') {
            formattedPaymentMethod = 'QRIS';
        } else if (body.payment_type === 'gopay') {
            formattedPaymentMethod = 'GOPAY';
        } else if (body.payment_type === 'shopeepay') {
            formattedPaymentMethod = 'SHOPEEPAY';
        } else {
            // uppercase whatever it is
            formattedPaymentMethod = formattedPaymentMethod.replace('_', ' ').toUpperCase();
        }

        console.log(`[Midtrans Webhook] Update Database - Order: ${order_id} -> Status: ${statusToUpdate} via ${formattedPaymentMethod}`);

        await fetch(`http://127.0.0.1:3000/api/bookings/${order_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: statusToUpdate,
                paymentType: formattedPaymentMethod
            })
        });

        // 4. Selalu kembalikan Response Status 200 agar Midtrans tahu webhook diterima
        return NextResponse.json({ success: true, statusUpdated: statusToUpdate }, { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
