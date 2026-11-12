import React from 'react';
import { BeautyProProfile } from '../../types';
import { Sparkles, Coffee, Shield, Heart, Award, UserCheck, MapPin } from 'lucide-react';

interface EditorialAboutProps {
  profile: BeautyProProfile;
  onBookClick: () => void;
}

const PILLARS = [
  {
    icon: Sparkles,
    title: 'Servicio Premium & Materiales Top-Tier',
    desc: 'Productos importados de la más alta calidad cosmética e hipoalergénicos.'
  },
  {
    icon: Coffee,
    title: 'Bebidas y Mimos de Cortesía',
    desc: 'Café de especialidad, agua saborizada o una copa de espumante para tu confort.'
  },
  {
    icon: Shield,
    title: 'Procedimientos Estériles & Seguros',
    desc: 'Bioseguridad hospitalaria, instrumental esterilizado en autoclave y materiales descartables.'
  },
  {
    icon: Heart,
    title: 'Atmósfera Cálida & Relajante',
    desc: 'Espacio boutique diseñado para desconectar del estrés y renovar tu energía.'
  },
  {
    icon: Award,
    title: 'Especialistas Altamente Calificadas',
    desc: 'Formación continua en las últimas tendencias internacionales de belleza y visagismo.'
  },
  {
    icon: UserCheck,
    title: 'Enfoque de Belleza Personalizado',
    desc: 'Evaluación previa de tu fisonomía para realzar lo mejor de tus rasgos naturales.'
  }
];

export const EditorialAbout: React.FC<EditorialAboutProps> = ({ profile, onBookClick }) => {
  return (
    <section id="sobre-nosotros" className="py-24 bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Story & Pillars */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#72202E] font-semibold block">
                Nuestra Filosofía
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-[#1F1E1D] uppercase leading-tight">
                More than a beauty
                <span className="font-script-luxury text-4xl sm:text-6xl text-[#72202E] lowercase block mt-1">
                  salon
                </span>
              </h2>
            </div>

            <p className="text-sm text-[#5A524C] leading-relaxed max-w-xl">
              Cada visita está diseñada para ser una experiencia serena, íntima y de lujo donde la excelencia técnica se fusiona con una atención cálida y personalizada.
            </p>

            {/* 6 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {PILLARS.map((p, i) => {
                const IconComponent = p.icon;
                return (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-full bg-[#F4EFEB] border border-[#E3DACF] text-[#72202E] shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1E1D]">
                        {p.title}
                      </h4>
                      <p className="text-xs text-[#7A7169] leading-snug">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4">
              <button
                onClick={onBookClick}
                className="px-8 py-3.5 bg-[#72202E] hover:bg-[#581520] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
              >
                Conoce Nuestros Horarios
              </button>
            </div>
          </div>

          {/* Right Column: Studio Interior Atmosphere */}
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-2xl shadow-xl border border-[#E3DACF] aspect-[4/5] bg-[#EAE3D9]">
              <img
                src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=900&auto=format&fit=crop&q=80"
                alt="Studio Interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Studio Address Pill */}
              <div className="absolute bottom-6 inset-x-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/80 space-y-1">
                <div className="flex items-center gap-2 text-[#72202E]">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F1E1D]">
                    {profile.businessName || 'Estudio Exclusivo'}
                  </span>
                </div>
                <p className="text-xs text-[#5A524C] pl-6">
                  {profile.address || 'Atención personalizada con cita previa'}
                  {profile.city ? ` · ${profile.city}` : ''}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
