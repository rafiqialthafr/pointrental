import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const fallbackRatings = [];

// GET /api/ratings?carId=car_1
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const carId = searchParams.get('carId');

        try {
            let query = supabase.from('ratings').select('*').order('createdAt', { ascending: false });
            if (carId) query = query.eq('carId', carId);

            const { data: ratings, error } = await query;
            if (!error && ratings) {
                if (carId) {
                    const avg = ratings.length > 0
                        ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10) / 10
                        : 0;
                    return NextResponse.json({ carId, average: avg, total: ratings.length, ratings });
                }
                return NextResponse.json(ratings);
            }
        } catch (dbErr) {
            console.warn('[Supabase Ratings GET Warning]', dbErr.message);
        }

        if (carId) {
            return NextResponse.json({ carId, average: 0, total: 0, ratings: [] });
        }
        return NextResponse.json(fallbackRatings);
    } catch (err) {
        return NextResponse.json({ carId: '', average: 0, total: 0, ratings: [] });
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

        const newRating = {
            id: `rating-${Date.now()}`,
            carId,
            name,
            score: Number(score),
            review: review || '',
            createdAt: new Date().toISOString()
        };

        try {
            await supabase.from('ratings').insert([newRating]);
        } catch (dbErr) {
            console.warn('[Supabase Ratings POST Warning]', dbErr.message);
        }

        fallbackRatings.unshift(newRating);

        return NextResponse.json({ success: true, rating: newRating, newAverage: Number(score), totalRatings: 1 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

