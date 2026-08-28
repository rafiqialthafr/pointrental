import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCars, updateCar, deleteCar } from '@/lib/cars-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const formData = await req.formData();
        const cars = await getCars();
        const existingCar = cars.find(c => String(c.id) === String(id));

        if (!existingCar) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        let imageUrl = formData.get('image') || existingCar.image;
        const imageFile = formData.get('imageFile');

        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0 && imageFile.name) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const mimeType = imageFile.type || 'image/jpeg';
            
            // Persistent Data URL for cloud & serverless
            imageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

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
        }

        const priceVal = formData.get('pricePerDay');
        const seatsVal = formData.get('seats');

        const updatedFields = {
            brand: formData.get('brand') || existingCar.brand,
            model: formData.get('model') || existingCar.model,
            type: formData.get('type') || existingCar.type,
            transmission: formData.get('transmission') || existingCar.transmission,
            fuel: formData.get('fuel') || existingCar.fuel,
            pricePerDay: priceVal !== null && priceVal !== undefined && !isNaN(Number(priceVal)) ? Number(priceVal) : existingCar.pricePerDay,
            seats: seatsVal !== null && seatsVal !== undefined && !isNaN(Number(seatsVal)) ? Number(seatsVal) : existingCar.seats,
            status: formData.get('status') || existingCar.status,
            description: formData.has('description') ? (formData.get('description') || '') : existingCar.description,
            terms: formData.has('terms') ? (formData.get('terms') || '') : existingCar.terms,
            image: imageUrl,
            gallery: imageUrl !== existingCar.image ? [imageUrl] : (existingCar.gallery || [imageUrl])
        };

        const updatedCar = await updateCar(id, updatedFields);

        return NextResponse.json({ success: true, car: updatedCar });
    } catch (err) {
        console.error('PATCH /api/cars/[id] error:', err);
        return NextResponse.json({ error: 'Failed to update car: ' + err.message }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;
        await deleteCar(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/cars/[id] error:', err);
        return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }
}
