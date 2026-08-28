import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseOnline } from './supabase.js';

const dbPath = path.join(process.cwd(), 'src/data/cars.json');

// In-memory cache
let memoryCars = null;

function sortCars(cars) {
    if (!Array.isArray(cars)) return [];
    return [...cars].sort((a, b) => {
        // Natural numerical order by ID: car_1, car_2, car_3, ...
        const matchA = String(a.id || '').match(/\d+/);
        const matchB = String(b.id || '').match(/\d+/);
        const numA = matchA ? parseInt(matchA[0], 10) : NaN;
        const numB = matchB ? parseInt(matchB[0], 10) : NaN;

        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
            return numA - numB;
        }
        return String(a.id || '').localeCompare(String(b.id || ''));
    });
}

function readLocalCars() {
    try {
        if (fs.existsSync(dbPath)) {
            const raw = fs.readFileSync(dbPath, 'utf8');
            memoryCars = JSON.parse(raw);
            return sortCars(memoryCars);
        }
    } catch (e) {
        console.error('Error reading cars.json:', e.message);
    }
    return memoryCars ? sortCars(memoryCars) : [];
}

function writeLocalCars(cars) {
    memoryCars = sortCars(cars);
    try {
        fs.writeFileSync(dbPath, JSON.stringify(memoryCars, null, 4), 'utf8');
    } catch (e) {
        // Ignored on read-only serverless environments
    }
}

export async function getCars() {
    const online = await isSupabaseOnline();
    if (online) {
        try {
            const { data, error } = await supabase
                .from('cars')
                .select('*');
            
            if (!error && data && data.length > 0) {
                return sortCars(data);
            }
        } catch (err) {
            console.warn('[Supabase getCars Warning]', err.message);
        }
    }
    return readLocalCars();
}

export async function addCar(newCar) {
    const online = await isSupabaseOnline();
    if (online) {
        try {
            const { data, error } = await supabase
                .from('cars')
                .insert([newCar])
                .select()
                .single();

            if (!error && data) {
                const local = readLocalCars();
                local.push(data);
                writeLocalCars(local);
                return data;
            }
            if (error) {
                console.error('[Supabase addCar Error]', error.message);
            }
        } catch (err) {
            console.warn('[Supabase addCar Warning]', err.message);
        }
    }
    const local = readLocalCars();
    local.push(newCar);
    writeLocalCars(local);
    return newCar;
}

export async function updateCar(id, updatedFields) {
    const online = await isSupabaseOnline();
    if (online) {
        try {
            const { data, error } = await supabase
                .from('cars')
                .update({ ...updatedFields, updatedAt: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (!error && data) {
                const local = readLocalCars();
                const idx = local.findIndex(c => String(c.id) === String(id));
                if (idx !== -1) {
                    local[idx] = data;
                    writeLocalCars(local);
                }
                return data;
            }
            if (error) {
                console.error('[Supabase updateCar Error]', error.message);
            }
        } catch (err) {
            console.warn('[Supabase updateCar Warning]', err.message);
        }
    }
    const local = readLocalCars();
    const idx = local.findIndex(c => String(c.id) === String(id));
    if (idx !== -1) {
        local[idx] = { ...local[idx], ...updatedFields, updatedAt: new Date().toISOString() };
        writeLocalCars(local);
        return local[idx];
    }
    return null;
}

export async function deleteCar(id) {
    const online = await isSupabaseOnline();
    if (online) {
        try {
            const { error } = await supabase.from('cars').delete().eq('id', id);
            if (error) {
                console.error('[Supabase deleteCar Error]', error.message);
            }
        } catch (err) {
            console.warn('[Supabase deleteCar Warning]', err.message);
        }
    }
    let local = readLocalCars();
    local = local.filter(c => String(c.id) !== String(id));
    writeLocalCars(local);
    return true;
}

// Backward compatibility helper
export function saveCars(cars) {
    writeLocalCars(cars);
    return memoryCars;
}
