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

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const formData = await req.formData();
        const cars = getCars();
        const index = cars.findIndex(c => c.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        let imageUrl = formData.get('image') || cars[index].image;
        const imageFile = formData.get('imageFile');
        const uploadDir = path.join(process.cwd(), 'public/uploads');

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
        }

        cars[index] = {
            ...cars[index],
            brand: formData.get('brand') || cars[index].brand,
            model: formData.get('model') || cars[index].model,
            type: formData.get('type') || cars[index].type,
            transmission: formData.get('transmission') || cars[index].transmission,
            fuel: formData.get('fuel') || cars[index].fuel,
            pricePerDay: parseInt(formData.get('pricePerDay')) || cars[index].pricePerDay,
            seats: parseInt(formData.get('seats')) || cars[index].seats,
            status: formData.get('status') || cars[index].status,
            description: formData.get('description') || cars[index].description,
            terms: formData.get('terms') || cars[index].terms,
            image: imageUrl,
            gallery: imageUrl !== cars[index].image ? [imageUrl] : (cars[index].gallery || [imageUrl])
        };

        saveCars(cars);

        return NextResponse.json({ success: true, car: cars[index] });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;
        let cars = getCars();
        cars = cars.filter(c => c.id !== id);
        saveCars(cars);

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }
}
