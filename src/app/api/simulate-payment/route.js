import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API Endpoint: Auto-simulate payment di Midtrans Sandbox
 * 
 * Flow:
 * 1. Ambil transaction status dari Midtrans Core API → dapat VA number / payment details
 * 2. POST ke Midtrans Sandbox Simulator untuk "bayar" otomatis
 * 3. Setelah ini, "Check Status" di Snap popup akan nunjukin SUCCESS
 */
export async function POST(request) {
    try {
        const { orderId } = await request.json();
        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
        const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

        // Step 1: Ambil transaction status dari Midtrans Core API
        const statusRes = await fetch(
            `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
            {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!statusRes.ok) {
            const errText = await statusRes.text();
            console.error('[Simulate] Failed to get status:', errText);
            return NextResponse.json({ error: 'Failed to get transaction status', detail: errText }, { status: 500 });
        }

        const statusData = await statusRes.json();
        console.log('[Simulate] Transaction status:', JSON.stringify(statusData, null, 2));

        // Kalau sudah settlement, ga perlu simulate lagi, langsung paksa Supabase UPDATE ke PAID
        if (statusData.transaction_status === 'settlement' || statusData.transaction_status === 'capture') {
            await supabase
                .from('bookings')
                .update({ status: 'PAID', updatedAt: new Date().toISOString() })
                .eq('midtransOrderId', orderId);
            return NextResponse.json({ success: true, message: 'Already settled', status: statusData.transaction_status });
        }

        const paymentType = statusData.payment_type;
        let simulateResult = null;

        // Step 2: Simulate payment berdasarkan payment type
        if (paymentType === 'bank_transfer') {
            // Virtual Account payment
            const vaNumbers = statusData.va_numbers;
            if (vaNumbers && vaNumbers.length > 0) {
                const vaNumber = vaNumbers[0].va_number;
                const bank = vaNumbers[0].bank;
                simulateResult = await simulateVAPayment(bank, vaNumber);
            } else if (statusData.permata_va_number) {
                // Permata VA has different structure
                simulateResult = await simulateVAPayment('permata', statusData.permata_va_number);
            } else if (statusData.bill_key) {
                // Mandiri Bill Payment
                simulateResult = await simulateVAPayment('mandiri', statusData.bill_key);
            }
        } else if (paymentType === 'echannel') {
            // Mandiri Bill
            simulateResult = await simulateVAPayment('mandiri', statusData.bill_key);
        } else if (paymentType === 'qris' || paymentType === 'gopay' || paymentType === 'shopeepay') {
            // QRIS / GoPay / ShopeePay — simulate via QRIS simulator
            // These use QR code, we need to get the QR URL
            const qrUrl = statusData.actions?.find(a => a.name === 'generate-qr-code')?.url;
            if (qrUrl) {
                simulateResult = await simulateQRISPayment(qrUrl);
            } else {
                // Try deeplink simulation
                simulateResult = { success: false, message: 'QRIS/e-wallet: no QR URL found, use credit card for instant settlement' };
            }
        } else if (paymentType === 'credit_card') {
            // Credit card biasanya auto-settle di sandbox
            simulateResult = { success: true, message: 'Credit card auto-settles in sandbox' };
        }

        if (!simulateResult) {
            return NextResponse.json({
                success: false,
                message: `Payment type "${paymentType}" — simulation not supported. Use Credit Card for instant success.`,
                transactionData: statusData
            });
        }

        // Simulate berhasil - UPDATE SUPABASE LANGSUNG KARENA WEBHOOK GA BISA NGEHIT LOCALHOST
        if (simulateResult.success) {
            await supabase
                .from('bookings')
                .update({
                    status: 'PAID',
                    updatedAt: new Date().toISOString()
                })
                .eq('midtransOrderId', orderId);
            console.log(`[Simulate] Berhasil auto-update status ${orderId} ke PAID di Supabase`);
        }

        return NextResponse.json({
            success: simulateResult.success,
            message: simulateResult.message,
            paymentType,
            orderId,
        });

    } catch (error) {
        console.error('[Simulate] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Simulate VA payment via Midtrans Sandbox Simulator
 */
async function simulateVAPayment(bank, vaNumber) {
    try {
        // Map bank names to simulator endpoints
        const simulatorEndpoints = {
            'bca': 'https://simulator.sandbox.midtrans.com/bca/va/index',
            'bni': 'https://simulator.sandbox.midtrans.com/bni/va/index',
            'bri': 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=bri',
            'permata': 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=permata',
            'cimb': 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=cimb',
            'mandiri': 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=mandiri',
            'danamon': 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=danamon',
        };

        const endpoint = simulatorEndpoints[bank.toLowerCase()];
        if (!endpoint) {
            return { success: false, message: `No simulator for bank: ${bank}` };
        }

        // POST form data to simulator (inquiry + pay)
        // Step 1: Inquiry
        const inquiryRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `va_number=${vaNumber}`,
        });

        if (inquiryRes.ok) {
            // Step 2: Pay — re-POST to trigger payment
            const payRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `va_number=${vaNumber}&pay=Pay`,
            });

            return {
                success: payRes.ok,
                message: payRes.ok
                    ? `VA Payment simulated for ${bank.toUpperCase()} (${vaNumber})`
                    : `Inquiry OK but Pay failed for ${bank.toUpperCase()}`
            };
        }

        return { success: false, message: `VA Inquiry failed for ${bank.toUpperCase()}` };
    } catch (err) {
        return { success: false, message: `VA Simulation error: ${err.message}` };
    }
}

/**
 * Simulate QRIS payment via Midtrans Sandbox Simulator
 */
async function simulateQRISPayment(qrUrl) {
    try {
        const res = await fetch('https://simulator.sandbox.midtrans.com/v2/qris/index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `qr_url=${encodeURIComponent(qrUrl)}`,
        });

        return {
            success: res.ok,
            message: res.ok ? 'QRIS payment simulated' : 'QRIS simulation failed',
        };
    } catch (err) {
        return { success: false, message: `QRIS Simulation error: ${err.message}` };
    }
}
