import { Star } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export default function TestimonialCard({ testimonial }) {
    const { isLight } = useTheme();
    const isDark = !isLight;

    return (
        <div className={`rounded-2xl p-6 flex flex-col h-full hover:shadow-lg hover:shadow-black/5 transition-all duration-500 border ${isDark
                ? 'bg-[#0B0F19] border-neutral-900 hover:border-neutral-800'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
            {/* Stars */}
            <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Comment */}
            <p className={`text-sm leading-relaxed mb-6 flex-grow ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                &ldquo;{testimonial.comment}&rdquo;
            </p>

            {/* Author */}
            <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-neutral-900' : 'border-slate-100'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8C872] to-[#AF955B] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {testimonial.avatar}
                </div>
                <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
            </div>
        </div>
    );
}
