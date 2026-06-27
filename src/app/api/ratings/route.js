import { NextResponse } from 'next/server';
import { getRatings, saveRatings } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/ratings?carId=car_1  (or without query to get all)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const carId = searchParams.get('carId');
        const ratings = getRatings();

        if (carId) {
            const carRatings = ratings.filter(r => r.carId === carId);
            const avg = carRatings.length > 0
                ? Math.round((carRatings.reduce((sum, r) => sum + r.score, 0) / carRatings.length) * 10) / 10
                : 0;
            return NextResponse.json({
                carId,
                average: avg,
                total: carRatings.length,
                ratings: carRatings
            });
        }

        return NextResponse.json(ratings);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }
}

// POST /api/ratings
export async function POST(req) {
    try {
        const body = await req.json();
        const { carId, name, score, review } = body;

        if (!carId || !name || !score) {
            return NextResponse.json({ error: 'carId, name, dan score wajib diisi' }, { status: 400 });
        }

        if (score < 1 || score > 5) {
            return NextResponse.json({ error: 'Score harus 1-5' }, { status: 400 });
        }

        const ratings = getRatings();

        const newRating = {
            id: `rating-${Date.now()}`,
            carId,
            name,
            score: Number(score),
            review: review || '',
            createdAt: new Date().toISOString()
        };

        ratings.push(newRating);
        saveRatings(ratings);

        // Calculate new average
        const carRatings = ratings.filter(r => r.carId === carId);
        const avg = Math.round((carRatings.reduce((sum, r) => sum + r.score, 0) / carRatings.length) * 10) / 10;

        return NextResponse.json({
            success: true,
            rating: newRating,
            newAverage: avg,
            totalRatings: carRatings.length
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
