import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/ratings?carId=car_1
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const carId = searchParams.get('carId');

        let query = supabase.from('ratings').select('*').order('createdAt', { ascending: false });
        if (carId) query = query.eq('carId', carId);

        const { data: ratings, error } = await query;
        if (error) throw error;

        if (carId) {
            const avg = ratings.length > 0
                ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10) / 10
                : 0;
            return NextResponse.json({ carId, average: avg, total: ratings.length, ratings });
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

        const newRating = {
            id: `rating-${Date.now()}`,
            carId,
            name,
            score: Number(score),
            review: review || '',
            createdAt: new Date().toISOString()
        };

        const { error } = await supabase.from('ratings').insert([newRating]);
        if (error) throw error;

        // Hitung average baru
        const { data: carRatings } = await supabase.from('ratings').select('score').eq('carId', carId);
        const avg = carRatings && carRatings.length > 0
            ? Math.round((carRatings.reduce((sum, r) => sum + r.score, 0) / carRatings.length) * 10) / 10
            : Number(score);

        return NextResponse.json({ success: true, rating: newRating, newAverage: avg, totalRatings: carRatings?.length || 1 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
