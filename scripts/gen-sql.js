const d = require('../src/data/bookings.json');
const fs = require('fs');
const path = require('path');

const existing = ['INV-1780748039785', 'INV-1780750460571', 'INV-1780750739754'];
const rows = d.filter(b => !existing.includes(b.id)).map(b => {
    const esc = s => s ? String(s).replace(/'/g, "''") : '';
    const val = v => (v === undefined || v === null) ? 'NULL' : `'${esc(v)}'`;
    const num = v => (v === undefined || v === null || isNaN(v)) ? 0 : Number(v);
    return `(${val(b.id)},${val(b.customerName)},${val(b.customerEmail)},${val(b.customerPhone)},${val(b.carId)},${val(b.carModel)},${val(b.date)},${num(b.days)},${num(b.totalPrice)},${val(b.status)},${val(b.paymentType)},${val(b.createdAt)},${val(b.updatedAt)})`;
});

const sql = `INSERT INTO bookings (id,"customerName","customerEmail","customerPhone","carId","carModel",date,days,"totalPrice",status,"paymentType","createdAt","updatedAt") VALUES\n` + rows.join(',\n') + `\nON CONFLICT (id) DO NOTHING;`;

fs.writeFileSync(path.join(__dirname, 'insert_bookings.sql'), sql);
console.log('SQL dibuat! Total rows:', rows.length);
