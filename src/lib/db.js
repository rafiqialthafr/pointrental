import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/bookings.json');
const ratingsPath = path.join(process.cwd(), 'src/data/ratings.json');

export function getBookings() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, '[]', 'utf8');
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

export function saveBookings(bookings) {
    fs.writeFileSync(dbPath, JSON.stringify(bookings, null, 2), 'utf8');
}

export function getRatings() {
    if (!fs.existsSync(ratingsPath)) {
        fs.writeFileSync(ratingsPath, '[]', 'utf8');
    }
    const data = fs.readFileSync(ratingsPath, 'utf8');
    return JSON.parse(data);
}

export function saveRatings(ratings) {
    fs.writeFileSync(ratingsPath, JSON.stringify(ratings, null, 2), 'utf8');
}
