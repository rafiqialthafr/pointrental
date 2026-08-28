import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/cars.json');

// In-memory cache for rapid and resilient storage
let memoryCars = null;

export function getCars() {
    try {
        if (fs.existsSync(dbPath)) {
            const raw = fs.readFileSync(dbPath, 'utf8');
            memoryCars = JSON.parse(raw);
            return memoryCars;
        }
    } catch (e) {
        console.error('Error reading cars.json:', e.message);
    }
    if (memoryCars) return memoryCars;
    return [];
}

export function saveCars(cars) {
    memoryCars = [...cars];
    let retries = 5;
    while (retries > 0) {
        try {
            fs.writeFileSync(dbPath, JSON.stringify(cars, null, 4), 'utf8');
            break;
        } catch (e) {
            retries--;
            if (retries === 0) {
                console.warn('[CarsStore] Could not write cars.json after retries:', e.message);
            }
        }
    }
    return memoryCars;
}
