import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request) {
    try {
        const body = await request.json();

        let coreApi = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
        });

        const orderId = `BOOK-${Date.now()}`;
        const finalPrice = Math.round(body.totalPrice);

        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": finalPrice
            },
            "customer_details": {
                "first_name": body.userName,
                "email": body.userEmail,
                "phone": body.phone
            },
            "item_details": [
                {
                    "id": (body.carId || 'CAR').substring(0, 50),
                    "price": finalPrice,
                    "quantity": 1,
                    "name": (`Sewa: ${body.carModel || 'Mobil'}`).substring(0, 50)
                }
            ]
        };

        // Deteksi tipe pembayaran dari UI Custom kita (Format: VA-BCA, atau EW-Gopay)
        const methodParts = body.paymentMethod.split('-');
        const type = methodParts[0]; // VA atau EW
        const vendor = methodParts[1] ? methodParts[1].toLowerCase() : '';

        if (type === 'VA') {
            parameter.payment_type = "bank_transfer";
            parameter.bank_transfer = {
                "bank": vendor // bca, bni, bri
            };
            if (vendor === 'mandiri') {
                parameter.payment_type = "echannel";
                parameter.echannel = { "bill_info1": "Payment:", "bill_info2": "Online purchase" };
            }
        }
        else if (type === 'EW') {
            if (vendor === 'gopay') {
                parameter.payment_type = "gopay";
            } else if (vendor === 'shopeepay') {
                parameter.payment_type = "shopeepay";
                parameter.shopeepay = { "callback_url": "http://localhost:3000" };
            } else {
                // QRIS umum untuk e-wallet lain
                parameter.payment_type = "qris";
            }
        }

        const chargeResponse = await coreApi.charge(parameter);
        console.log("Core API Charge Response:", chargeResponse);

        return NextResponse.json({ success: true, data: chargeResponse });

    } catch (error) {
        console.error("Core API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
