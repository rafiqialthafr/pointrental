import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/bookings.json');
const ratingsPath = path.join(process.cwd(), 'src/data/ratings.json');

export function getBookings() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, '[]', 'utf8');
        }
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export function saveBookings(bookings) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(bookings, null, 2), 'utf8');
    } catch (e) {
        console.warn('[Vercel FS Bypass] Could not write bookings:', e.message);
    }
}

export function getRatings() {
    try {
        if (!fs.existsSync(ratingsPath)) {
            fs.writeFileSync(ratingsPath, '[]', 'utf8');
        }
        const data = fs.readFileSync(ratingsPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export function saveRatings(ratings) {
    try {
        fs.writeFileSync(ratingsPath, JSON.stringify(ratings, null, 2), 'utf8');
    } catch (e) {
        console.warn('[Vercel FS Bypass] Could not write ratings:', e.message);
    }
}
