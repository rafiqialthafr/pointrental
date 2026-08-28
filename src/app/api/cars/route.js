import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCars, addCar } from '@/lib/cars-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
};

export async function GET() {
    try {
        const cars = await getCars();
        return NextResponse.json(cars, { headers: NO_CACHE_HEADERS });
    } catch (err) {
        console.error('GET /api/cars error:', err);
        return NextResponse.json([], { headers: NO_CACHE_HEADERS });
    }
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        let imageUrl = formData.get('image');
        const imageFile = formData.get('imageFile');

        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0 && imageFile.name) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const mimeType = imageFile.type || 'image/jpeg';
            
            // Generate Data URL for 100% persistent storage across Vercel and local
            imageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

            // Optional: try saving locally if filesystem allows
            try {
                const uploadDir = path.join(process.cwd(), 'public/uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, buffer);
            } catch (e) {
                // Ignore filesystem write errors on Vercel
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
            features: ['Unit Terawat', 'Full AC', 'Audio Premium', 'Driver Pilihan'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const createdCar = await addCar(newCar);

        return NextResponse.json({ success: true, car: createdCar });
    } catch (err) {
        console.error('POST /api/cars error:', err);
        return NextResponse.json({ error: 'Failed to add car: ' + err.message }, { status: 500 });
    }
}
