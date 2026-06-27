const fs = require('fs');
let code = fs.readFileSync('src/app/cars/[id]/page.js', 'utf8');

// Update imports
if (!code.includes('useTheme')) {
    code = code.replace(/import \{ useState, useEffect \} from 'react';/, "import { useState, useEffect } from 'react';\nimport { useTheme } from '@/components/ThemeContext';");
    code = code.replace(/export default function CarDetail\(\) \{/, 'export default function CarDetail() {\n    const { isLight } = useTheme();\n    const isDark = !isLight;');
}

// Helper to wrap classes in conditional template literals
function makeConditional(match, currentClassStr) {
    if (match.startsWith('className={')) return match; // skip already dynamic

    // Check if it has any dark specific classes
    if (/bg-\[#[a-fA-F0-9]+\]|text-white|bg-\[#131825\]|bg-black|border-white|text-gray-300|text-gray-400/.test(currentClassStr)) {
        let darkClasses = currentClassStr.split(' ');
        let lightClasses = darkClasses.map(c => {
            if (c === 'bg-[#0a0a0a]' || c === 'bg-[#0B0F19]' || c === 'bg-black') return 'bg-[#F4F7FE]';
            if (c === 'bg-[#131825]' || c === 'bg-[#111111]' || c === 'bg-[#0E1320]') return 'bg-white';
            if (c === 'text-white') return 'text-slate-800';
            if (c === 'text-gray-300' || c === 'text-gray-400') return 'text-slate-500';
            if (c === 'text-gray-500') return 'text-slate-400';
            if (c === 'border-white/10' || c === 'border-white/5' || c === 'border-white/20') return 'border-slate-200 border';
            if (c === 'bg-white/5' || c === 'bg-white/10') return 'bg-slate-100';
            if (c === 'shadow-[#0a0a0a]') return 'shadow-slate-300/30';
            return c;
        });

        let lightStr = lightClasses.join(' ');
        // Don't modify if identical
        if (currentClassStr !== lightStr) {
            return 'className={`' + '${isDark ? \'' + currentClassStr + '\' : \'' + lightStr + '\'}' + '`}';
        }
    }
    return match;
}

code = code.replace(/className=\"([^\"]+)\"/g, (m, c) => makeConditional(m, c));

fs.writeFileSync('src/app/cars/[id]/page.js', code);
console.log('Update Complete');
