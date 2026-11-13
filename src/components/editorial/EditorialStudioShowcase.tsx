import React, { useState } from 'react';
import { BeautyProProfile } from '../../types';
import { MapPin, Sparkles, Shield, Coffee, ChevronRight, Eye, Check } from 'lucide-react';

interface EditorialStudioShowcaseProps {
  profile: BeautyProProfile;
  onBookClick: () => void;
}

export const EditorialStudioShowcase: React.FC<EditorialStudioShowcaseProps> = ({
  profile,
  onBookClick
}) => {
  const facadeImg =
    profile.facadePhotoUrl ||
    profile.coverUrl ||
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80';

  const workspaceImg =
    profile.workspacePhotoUrl ||
    profile.salonPhotos?.[1]?.url ||
    profile.salonPhotos?.[0]?.url ||
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&auto=format&fit=crop&q=80';

  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  return (
    <section id="espaco-studio" className="py-20 bg-[#F4EFEB] border-t border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#72202E] font-semibold block">
              Nosso Espaço Exclusivo
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#1F1E1D] uppercase leading-tight">
              O Estúdio
              <span className="font-script-luxury text-4xl sm:text-6xl text-[#72202E] lowercase block mt-1">
                fachada & atendimento
              </span>
            </h2>
          </div>

          <div className="max-w-md space-y-3">
            <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed">
              Conheça onde a magia acontece. Um ambiente planejado para o seu máximo conforto, relaxamento e segurança, desde a chegada até a finalização do seu procedimento.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#72202E]">
              <Sparkles className="w-4 h-4 text-[#C4A480]" />
              <span>Ambiente 100% higienizado & climatizado</span>
            </div>
          </div>
        </div>

        {/* Dual Showcase Cards (Fachada & Espaço de Atendimento) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CARD 1: FACHADA & ENTRADA DO ESTÚDIO */}
          <div className="group bg-[#FBF9F5] border border-[#E3DACF] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#EAE3D9]">
              <img
                src={facadeImg}
                alt="Fachada do Estúdio"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold tracking-wider text-[#72202E] uppercase shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#72202E]" />
                  Fachada & Entrada
                </span>
              </div>

              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => setActivePhotoModal(facadeImg)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
                title="Ampliar foto"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Bottom Card Overlay */}
              <div className="absolute bottom-4 inset-x-4 text-white">
                <span className="text-[10px] uppercase tracking-widest text-[#E6C280] font-semibold block mb-0.5">
                  Localização Privilegiada
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white drop-shadow">
                  {profile.businessName || 'Fachada do Estúdio'}
                </h3>
              </div>
            </div>

            {/* Card Content & Details */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed">
                  Espaço de fácil localização com recepção acolhedora e segurança para você chegar com tranquilidade ao seu momento de cuidado.
                </p>

                <div className="flex items-start gap-2 pt-2 text-xs text-[#1F1E1D]">
                  <MapPin className="w-4 h-4 text-[#72202E] shrink-0 mt-0.5" />
                  <span className="font-medium">
                    {profile.address || 'Endereço exclusivo no centro da cidade'}
                    {profile.city ? `, ${profile.city}` : ''}
                  </span>
                </div>
              </div>

              {/* Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EAE3D9]">
                <span className="px-2.5 py-1 rounded-md bg-[#F4EFEB] text-[11px] text-[#5A524C] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#72202E]" />
                  Fácil Acesso
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4EFEB] text-[11px] text-[#5A524C] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#72202E]" />
                  Recepção VIP
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4EFEB] text-[11px] text-[#5A524C] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#72202E]" />
                  Estacionamento Próximo
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: ESPAÇO DE ATENDIMENTO & MACA */}
          <div className="group bg-[#FBF9F5] border border-[#E3DACF] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#EAE3D9]">
              <img
                src={workspaceImg}
                alt="Espaço de Atendimento"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold tracking-wider text-[#72202E] uppercase shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#72202E]" />
                  Espaço de Atendimento
                </span>
              </div>

              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => setActivePhotoModal(workspaceImg)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
                title="Ampliar foto"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Bottom Card Overlay */}
              <div className="absolute bottom-4 inset-x-4 text-white">
                <span className="text-[10px] uppercase tracking-widest text-[#E6C280] font-semibold block mb-0.5">
                  Conforto & Biosegurança
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white drop-shadow">
                  Sala de Procedimentos & Visagismo
                </h3>
              </div>
            </div>

            {/* Card Content & Details */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed">
                  Maca ergonômica acolchoada de alta densidade, iluminação dermatológica específica e instrumentos 100% esterilizados em autoclave hospitalar.
                </p>

                <div className="flex items-center gap-4 text-xs text-[#1F1E1D] pt-2">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#72202E]" />
                    <span className="font-semibold">Autoclave Hospitalar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-[#72202E]" />
                    <span className="font-semibold">Bebidas Cortesia</span>
                  </div>
                </div>
              </div>

              {/* Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EAE3D9]">
                <span className="px-2.5 py-1 rounded-md bg-[#F4EFEB] text-[11px] text-[#5A524C] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#72202E]" />
                  Maca Aquecida
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4EFEB] text-[11px] text-[#5A524C] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#72202E]" />
                  Ar-condicionado
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4EFEB] text-[11px] text-[#5A524C] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#72202E]" />
                  Luz Daylight Cílios
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Gallery Strip of Additional Salon Photos if any */}
        {profile.salonPhotos && profile.salonPhotos.length > 0 && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#1F1E1D]">
                Mais Ambientes do Estúdio
              </span>
              <span className="text-[11px] text-[#7A7169]">
                {profile.salonPhotos.length} fotos disponíveis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {profile.salonPhotos.slice(0, 4).map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setActivePhotoModal(photo.url)}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E3DACF] bg-[#EAE3D9] cursor-pointer shadow-2xs hover:border-[#72202E] transition-all"
                >
                  <img
                    src={photo.url}
                    alt={photo.title || 'Foto do espaço'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-5 h-5 drop-shadow" />
                  </div>
                  <div className="absolute bottom-1.5 inset-x-2 text-[10px] text-white font-medium truncate drop-shadow">
                    {photo.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA to Book */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#EAE3D9]">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-sm font-serif font-bold text-[#1F1E1D]">
              Gostou do nosso espaço?
            </h4>
            <p className="text-xs text-[#7A7169]">
              Escolha o melhor dia e horário para o seu atendimento exclusivo.
            </p>
          </div>

          <button
            onClick={onBookClick}
            className="w-full sm:w-auto px-6 py-3 bg-[#72202E] hover:bg-[#581520] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <span>Agendar Atendimento Neste Espaço</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Lightbox Photo Modal */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black"
          >
            <img
              src={activePhotoModal}
              alt="Ambiente do Estúdio"
              className="max-h-[85vh] w-auto object-contain"
            />
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
