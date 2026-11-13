import React from 'react';
import { BeautyProProfile } from '../../types';
import { Phone, Instagram, MapPin, Clock } from 'lucide-react';
import { cleanPhoneNumber } from '../../utils/whatsapp';

interface EditorialFooterProps {
  profile: BeautyProProfile;
  onBookClick: () => void;
  onOpenAdminLogin?: () => void;
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({ profile, onBookClick, onOpenAdminLogin }) => {
  return (
    <footer id="contacto" className="bg-[#1F1E1D] text-[#EAE3D9] pt-16 pb-12 border-t border-[#33302D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
              {profile.businessName || 'GlowBeauty Pro'}
            </h3>
            <p className="font-script-luxury text-3xl text-[#E6C280] -mt-2">
              natural beauty
            </p>
            <p className="text-xs text-[#A89E94] max-w-sm leading-relaxed">
              Estúdio exclusivo de visagismo, extensão de cílios, sobrancelhas e estética premium. Criamos experiências para você se sentir confiante, radiante e única.
            </p>
            <div className="pt-2 flex items-center gap-3">
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#2C2926] hover:bg-[#72202E] text-white transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              <a
                href={`https://wa.me/${cleanPhoneNumber(profile.whatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-[#2C2926] hover:bg-[#128C7E] text-white transition-colors"
                title="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-[#A89E94]">
              <li><a href="#hero" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Serviços & Valores</a></li>
              <li><a href="#sobre-nosotros" className="hover:text-white transition-colors">O Estúdio & Filosofia</a></li>
              <li><a href="#galeria" className="hover:text-white transition-colors">Galeria de Resultados</a></li>
              <li>
                <button
                  onClick={onBookClick}
                  className="text-[#E6C280] hover:underline font-semibold"
                >
                  Agendar Horário Online →
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Atendimento & Localização
            </h4>
            <div className="space-y-3 text-xs text-[#A89E94]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E6C280] shrink-0 mt-0.5" />
                <span>
                  {profile.address || 'Localização exclusiva'}
                  {profile.city ? `, ${profile.city}` : ''}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#E6C280] shrink-0 mt-0.5" />
                <span>
                  Segunda a Sábado: {profile.workingHours?.start || '09:00'} às {profile.workingHours?.end || '19:30'}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#E6C280] shrink-0 mt-0.5" />
                <span>{profile.whatsapp}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#33302D] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A7169] gap-4">
          <p>© {new Date().getFullYear()} {profile.businessName || 'GlowBeauty Pro'}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Plataforma desenvolvida com <span className="text-[#E6C280] font-semibold">GlowBeauty Pro</span>
            </p>
            {onOpenAdminLogin && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-[#7A7169] hover:text-[#E6C280] transition-colors underline text-[10px]"
                title="Acesso restrito da especialista"
              >
                Área da Especialista
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

