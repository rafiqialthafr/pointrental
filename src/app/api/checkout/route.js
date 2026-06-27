import midtransClient from 'midtrans-client';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();

        // PENTING: Akun Midtrans ini adalah Sandbox tapi kuncinya tidak berawalan SB-.
        // Jadi kita PAKSA isProduction = false agar mengarah ke API Sandbox.
        // Kalau nanti sudah punya kunci Production sungguhan, ubah jadi true.
        let snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: serverKey
        });

        // 2. Buat ID Pesanan (Bisa ambil/generasi dari database Anda)
        const orderId = `BOOK-${Date.now()}`;

        // 3. Setup Parameter Transaksi
        const finalPrice = Math.round(body.totalPrice);
        let safeEmail = body.userEmail;
        if (!safeEmail || !safeEmail.includes('@') || !safeEmail.includes('.')) {
            safeEmail = 'customer@pointrental.id';
        }

        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": finalPrice
            },
            "customer_details": {
                "first_name": body.userName || 'Customer',
                "email": safeEmail
            },
            "item_details": [
                {
                    "id": (body.carId || 'CAR-01').substring(0, 50),
                    "price": finalPrice,
                    "quantity": 1,
                    "name": (`Sewa: ${body.carModel || 'Mobil'}`).substring(0, 50)
                }
            ]
        };

        // 4. (Opsional) Simpan data order awal ke Database Anda sebagai PENDING
        // await db.booking.create({ data: { orderId, status: 'PENDING_PAYMENT', ... } });

        // 5. Generate Snap Token dari Midtrans
        const transaction = await snap.createTransaction(parameter);

        // 6. Kembalikan token ke Client
        return NextResponse.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            orderId: orderId
        });

    } catch (error) {
        console.error("Error Checkout API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
