import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface EditorialPortfolioProps {
  onBookClick: () => void;
}

const GALLERY_ITEMS = [
  {
    title: 'Extensión Clásica Fio a Fio',
    category: 'Pestañas',
    imageUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=600&auto=format&fit=crop&q=80',
    span: 'col-span-1 row-span-2'
  },
  {
    title: 'Diseño Visagista & Brow Lamination',
    category: 'Cejas',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    span: 'col-span-1 row-span-1'
  },
  {
    title: 'Alongamento em Fibra de Vidro',
    category: 'Uñas',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
    span: 'col-span-1 row-span-1'
  },
  {
    title: 'Volumen Ruso & Efecto Fox Eyes',
    category: 'Pestañas',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    span: 'col-span-1 md:col-span-2 row-span-1'
  }
];

export const EditorialPortfolio: React.FC<EditorialPortfolioProps> = ({ onBookClick }) => {
  return (
    <section id="galeria" className="py-24 bg-[#F4EFEB] border-t border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#72202E] font-semibold block">
              Galería de Trabajos
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#1F1E1D] uppercase leading-tight">
              Our work
              <span className="font-script-luxury text-4xl sm:text-6xl text-[#72202E] lowercase block mt-1">
                real results
              </span>
            </h2>
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed">
              Cada detalle cuenta y cada mirada es única. Descubre cómo realzamos la belleza natural de nuestras clientas con técnicas modernas y precisas.
            </p>
            <button
              onClick={onBookClick}
              className="px-6 py-2.5 bg-[#72202E] hover:bg-[#581520] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
            >
              Quiero Agendar un Turno
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-[260px]">
          {GALLERY_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden group bg-[#EAE3D9] border border-[#E3DACF] shadow-sm hover:shadow-xl transition-all ${item.span}`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute bottom-5 inset-x-5 text-white flex items-end justify-between">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-[#E6C280] block mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-base font-serif font-bold text-white">
                    {item.title}
                  </h4>
                </div>
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-[#72202E] transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
