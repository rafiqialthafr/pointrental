import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCars, saveCars } from '@/lib/cars-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
};

export async function GET() {
    return NextResponse.json(getCars(), { headers: NO_CACHE_HEADERS });
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        let imageUrl = formData.get('image');

        const imageFile = formData.get('imageFile');
        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0 && imageFile.name) {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
            const filePath = path.join(uploadDir, fileName);
            try {
                fs.writeFileSync(filePath, buffer);
                imageUrl = `/uploads/${fileName}`;
            } catch (e) {
                console.warn('[Upload] Could not write image:', e.message);
            }
        } else if (!imageUrl) {
            imageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";
        }

        const priceVal = formData.get('pricePerDay');
        const seatsVal = formData.get('seats');

        const newCar = {
            id: `car_${Date.now()}`,
            brand: formData.get('brand') || 'Toyota',
            model: formData.get('model') || 'Armada Baru',
            type: formData.get('type') || 'SUV',
            transmission: formData.get('transmission') || 'Otomatis',
            fuel: formData.get('fuel') || 'Bensin',
            pricePerDay: priceVal ? Number(priceVal) : 500000,
            seats: seatsVal ? Number(seatsVal) : 4,
            status: formData.get('status') || 'Tersedia',
            rating: 5.0,
            description: formData.get('description') || '',
            terms: formData.get('terms') || '',
            image: imageUrl,
            gallery: [imageUrl],
            features: ['Unit Terawat', 'Full AC', 'Audio Premium', 'Driver Pilihan']
        };

        const cars = getCars();
        cars.push(newCar);
        saveCars(cars);

        return NextResponse.json({ success: true, car: newCar });
    } catch (err) {
        console.error('POST /api/cars error:', err);
        return NextResponse.json({ error: 'Failed to add car: ' + err.message }, { status: 500 });
    }
}
