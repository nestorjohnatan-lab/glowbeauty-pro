import React from 'react';
import { BeautyProProfile } from '../../types';
import { Sparkles, ArrowRight, ShieldCheck, Star } from 'lucide-react';

interface EditorialHeroProps {
  profile: BeautyProProfile;
  onBookClick: () => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({ profile, onBookClick }) => {
  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Typography & Call to Action */}
          <div className="lg:col-span-7 space-y-8 z-10">
            {/* Tag / Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4EFEB] border border-[#E3DACF] text-[#72202E] text-xs uppercase tracking-[0.2em] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#C4A480]" />
              <span>Estúdio Exclusivo de Beleza & Olhar</span>
            </div>

            {/* Main Editorial Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-medium tracking-tight text-[#1F1E1D] uppercase leading-[1.05]">
                Enhance your
              </h1>
              <p className="font-script-luxury text-5xl sm:text-7xl xl:text-8xl text-[#72202E] leading-none pt-2 -ml-1">
                natural beauty
              </p>
            </div>

            {/* Metrics / Social Proof */}
            <div className="grid grid-cols-2 gap-6 pt-2 max-w-md border-y border-[#EAE3D9] py-4">
              <div>
                <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#1F1E1D]">
                  2+ anos
                </span>
                <span className="text-xs text-[#7A7169] tracking-wide">
                  de experiência em visagismo e extensão
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#1F1E1D]">
                  275+ clientes
                </span>
                <span className="text-xs text-[#7A7169] tracking-wide">
                  satisfeitas com atendimento impecável
                </span>
              </div>
            </div>

            {/* Microcopy & CTA */}
            <div className="space-y-6 pt-2">
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-[#5A524C] font-semibold max-w-lg leading-relaxed">
                Viva o conforto, a beleza e um atendimento personalizado e exclusivo em um só lugar.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onBookClick}
                  className="px-8 py-4 bg-[#72202E] hover:bg-[#581520] text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center gap-3"
                >
                  <span>Agendar Horário</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#servicios"
                  className="px-6 py-4 border border-[#1F1E1D]/20 hover:border-[#72202E] hover:text-[#72202E] text-[#1F1E1D] text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] transition-colors"
                >
                  Conhecer Serviços
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Glassmorphism Card */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md sm:max-w-lg">
              
              {/* Background Decorative Arch */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#EFE8DD] to-[#FBF9F5] rounded-t-full -z-10 border border-[#E3DACF]" />

              {/* Main Image */}
              <div className="overflow-hidden rounded-t-[140px] rounded-b-2xl shadow-2xl border-4 border-[#FBF9F5] bg-[#EAE3D9] aspect-[3/4]">
                <img
                  src="/assets/brand/vanessa_barazarte_hero.jpg"
                  alt={profile.name || 'Master Beauty Specialist'}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback to high quality beauty photo if local fails
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1583001809873-a128495da465?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Floating Glassmorphism Badge */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 right-4 sm:right-6 bg-white/85 backdrop-blur-md border border-white/70 p-4 sm:p-5 rounded-xl shadow-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#72202E] text-white flex items-center justify-center text-[10px] font-bold">
                      VB
                    </span>
                    <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#C4A480] text-white flex items-center justify-center text-[10px] font-bold">
                      ✨
                    </span>
                  </div>
                  <div className="flex items-center text-amber-500 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-[#1F1E1D] leading-snug">
                  Procedimentos exclusivos de beleza com produtos premium e resultados impecáveis.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

