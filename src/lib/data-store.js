import fs from 'fs/promises';
import path from 'path';

const CARS_FILE = path.join(process.cwd(), 'src/data/cars.json');
const RENTALS_FILE = path.join(process.cwd(), 'src/data/rentals.json');

export async function getCars() {
    const data = await fs.readFile(CARS_FILE, 'utf8');
    return JSON.parse(data);
}

export async function saveCars(cars) {
    await fs.writeFile(CARS_FILE, JSON.stringify(cars, null, 2));
}

export async function getRentals() {
    const data = await fs.readFile(RENTALS_FILE, 'utf8');
    return JSON.parse(data);
}

export async function saveRentals(rentals) {
    await fs.writeFile(RENTALS_FILE, JSON.stringify(rentals, null, 2));
}
