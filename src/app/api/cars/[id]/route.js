import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCars, saveCars } from '@/lib/cars-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const formData = await req.formData();
        const cars = getCars();
        const index = cars.findIndex(c => String(c.id) === String(id));

        if (index === -1) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        let imageUrl = formData.get('image') || cars[index].image;
        const imageFile = formData.get('imageFile');
        const uploadDir = path.join(process.cwd(), 'public/uploads');

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
        }

        const priceVal = formData.get('pricePerDay');
        const seatsVal = formData.get('seats');

        cars[index] = {
            ...cars[index],
            brand: formData.get('brand') || cars[index].brand,
            model: formData.get('model') || cars[index].model,
            type: formData.get('type') || cars[index].type,
            transmission: formData.get('transmission') || cars[index].transmission,
            fuel: formData.get('fuel') || cars[index].fuel,
            pricePerDay: priceVal !== null && priceVal !== undefined && !isNaN(Number(priceVal)) ? Number(priceVal) : cars[index].pricePerDay,
            seats: seatsVal !== null && seatsVal !== undefined && !isNaN(Number(seatsVal)) ? Number(seatsVal) : cars[index].seats,
            status: formData.get('status') || cars[index].status,
            description: formData.has('description') ? (formData.get('description') || '') : cars[index].description,
            terms: formData.has('terms') ? (formData.get('terms') || '') : cars[index].terms,
            image: imageUrl,
            gallery: imageUrl !== cars[index].image ? [imageUrl] : (cars[index].gallery || [imageUrl])
        };

        saveCars(cars);

        return NextResponse.json({ success: true, car: cars[index] });
    } catch (err) {
        console.error('PATCH /api/cars/[id] error:', err);
        return NextResponse.json({ error: 'Failed to update car: ' + err.message }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;
        let cars = getCars();
        cars = cars.filter(c => String(c.id) !== String(id));
        saveCars(cars);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/cars/[id] error:', err);
        return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }
}
