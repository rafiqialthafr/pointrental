const fs = require('fs');
const path = require('path');

const replacements = {
    // Backgrounds
    'bg-white': 'bg-black',
    'bg-slate-50': 'bg-[#0a0a0a]',
    'bg-gray-50': 'bg-[#0a0a0a]',
    'bg-slate-100': 'bg-[#111111]',
    'bg-gray-100': 'bg-[#111111]',
    'bg-slate-200': 'bg-[#1a1a1a]',
    'bg-gray-200': 'bg-[#1a1a1a]',
    'bg-slate-800': 'bg-[#111111]',
    'bg-slate-900': 'bg-black',
    'bg-gray-900': 'bg-black',

    // Text colors
    'text-slate-900': 'text-white',
    'text-gray-900': 'text-white',
    'text-slate-800': 'text-gray-200',
    'text-gray-800': 'text-gray-200',
    'text-slate-700': 'text-gray-300',
    'text-gray-700': 'text-gray-300',
    'text-slate-600': 'text-gray-400',
    'text-gray-600': 'text-gray-400',
    'text-white': 'text-black', // wait, sometimes text-white is button text, keeping it black on gold? actually avoid replacing text-white blindly.
    // wait, if we replace text-white to text-black it might break gold buttons. I'll NOT replace text-white automatically.

    // Borders
    'border-slate-200': 'border-neutral-800',
    'border-gray-200': 'border-neutral-800',
    'border-slate-100': 'border-neutral-900',
    'border-gray-100': 'border-neutral-900',
    'border-slate-300': 'border-neutral-700',
    'border-gray-300': 'border-neutral-700',

    // Divide
    'divide-slate-100': 'divide-neutral-900',
    'divide-gray-100': 'divide-neutral-900',
    'divide-slate-200': 'divide-neutral-800',
    'divide-gray-200': 'divide-neutral-800',

    // Specific shadows or colors might need tuning manually.
};

const regexReplaceList = [
    // text-black often used in light theme, make it text-white
    { regex: /\btext-black\b/g, replace: 'text-white' },
    { regex: /\bbg-white\b/g, replace: 'bg-black' },
    { regex: /\bbg-slate-50\b/g, replace: 'bg-[#0a0a0a]' },
    { regex: /\bbg-gray-50\b/g, replace: 'bg-[#0a0a0a]' },
    { regex: /\bbg-slate-100\b/g, replace: 'bg-[#111111]' },
    { regex: /\bbg-gray-100\b/g, replace: 'bg-[#111111]' },
    { regex: /\bbg-slate-200\b/g, replace: 'bg-[#1a1a1a]' },
    { regex: /\bbg-gray-200\b/g, replace: 'bg-[#1a1a1a]' },
    { regex: /\btext-slate-900\b/g, replace: 'text-white' },
    { regex: /\btext-gray-900\b/g, replace: 'text-white' },
    { regex: /\btext-slate-800\b/g, replace: 'text-gray-200' },
    { regex: /\btext-gray-800\b/g, replace: 'text-gray-200' },
    { regex: /\btext-slate-700\b/g, replace: 'text-gray-300' },
    { regex: /\btext-gray-700\b/g, replace: 'text-gray-300' },
    { regex: /\btext-slate-600\b/g, replace: 'text-gray-400' },
    { regex: /\btext-gray-600\b/g, replace: 'text-gray-400' },
    { regex: /\btext-slate-500\b/g, replace: 'text-gray-500' },
    { regex: /\btext-gray-500\b/g, replace: 'text-gray-500' },
    { regex: /\bborder-slate-200\b/g, replace: 'border-neutral-800' },
    { regex: /\bborder-gray-200\b/g, replace: 'border-neutral-800' },
    { regex: /\bborder-slate-100\b/g, replace: 'border-neutral-900' },
    { regex: /\bborder-gray-100\b/g, replace: 'border-neutral-900' },
    { regex: /\bborder-slate-300\b/g, replace: 'border-neutral-700' },
    { regex: /\bborder-gray-300\b/g, replace: 'border-neutral-700' },
    { regex: /\bdivide-slate-100\b/g, replace: 'divide-neutral-900' },
    { regex: /\bdivide-gray-100\b/g, replace: 'divide-neutral-900' },
    { regex: /\bdivide-slate-200\b/g, replace: 'divide-neutral-800' },
    { regex: /\bdivide-gray-200\b/g, replace: 'divide-neutral-800' },
];

function processPath(targetStr) {
    const stat = fs.statSync(targetStr);
    if (stat.isDirectory()) {
        for (const f of fs.readdirSync(targetStr)) {
            processPath(path.join(targetStr, f));
        }
    } else if (targetStr.endsWith('.js') || targetStr.endsWith('.jsx')) {
        let content = fs.readFileSync(targetStr, 'utf-8');
        let original = content;

        for (const { regex, replace } of regexReplaceList) {
            content = content.replace(regex, replace);
        }

        if (original !== content) {
            fs.writeFileSync(targetStr, content, 'utf-8');
            console.log('Updated:', targetStr);
        }
    }
}

processPath('c:/Users/hp/Documents/car/src');
