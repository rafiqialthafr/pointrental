import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/cars.json');

function getCars() {
    if (!fs.existsSync(dbPath)) return [];
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveCars(cars) {
    fs.writeFileSync(dbPath, JSON.stringify(cars, null, 4), 'utf8');
}

export async function GET() {
    return NextResponse.json(getCars());
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        let imageUrl = formData.get('image');

        const imageFile = formData.get('imageFile');
        if (imageFile && typeof imageFile !== 'string') {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            imageUrl = `/uploads/${fileName}`;
        } else if (!imageUrl) {
            imageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";
        }

        const newCar = {
            id: `car_${Date.now()}`,
            brand: formData.get('brand'),
            model: formData.get('model'),
            type: formData.get('type'),
            transmission: formData.get('transmission'),
            fuel: formData.get('fuel'),
            pricePerDay: parseInt(formData.get('pricePerDay')) || 0,
            seats: parseInt(formData.get('seats')) || 4,
            status: formData.get('status'),
            description: formData.get('description') || '',
            terms: formData.get('terms') || '',
            image: imageUrl,
            gallery: [imageUrl]
        };

        const cars = getCars();
        cars.push(newCar);
        saveCars(cars);

        return NextResponse.json({ success: true, car: newCar });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to add car' }, { status: 500 });
    }
}
