import { Star } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
    return (
        <div className="bg-[#0B0F19] border border-neutral-900 rounded-2xl p-6 flex flex-col h-full hover:shadow-lg hover:shadow-black/5 hover:border-neutral-800 transition-all duration-500">
            {/* Stars */}
            <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Comment */}
            <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">
                &ldquo;{testimonial.comment}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-900">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8C872] to-[#AF955B] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {testimonial.avatar}
                </div>
                <div>
                    <p className="text-sm font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
            </div>
        </div>
    );
}
