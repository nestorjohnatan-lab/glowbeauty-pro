import React, { useState } from 'react';
import { BeautyProProfile } from '../../types';
import { Sparkles, Phone, Instagram, Menu, X } from 'lucide-react';
import { cleanPhoneNumber } from '../../utils/whatsapp';

interface EditorialNavbarProps {
  profile: BeautyProProfile;
  onBookClick: () => void;
  onSwitchToProView?: () => void;
  isStandaloneClient?: boolean;
}

export const EditorialNavbar: React.FC<EditorialNavbarProps> = ({
  profile,
  onBookClick,
  onSwitchToProView,
  isStandaloneClient = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#EAE3D9] transition-all">
      {/* Top Floating Pro Switcher (when pro is viewing their own profile) */}
      {!isStandaloneClient && onSwitchToProView && (
        <div className="bg-[#72202E] text-white px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C280]" />
            <span>Modo de visualização da cliente</span>
          </span>
          <button
            onClick={onSwitchToProView}
            className="px-3 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-medium text-[11px] transition-colors"
          >
            Voltar ao Painel PRO →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Name / Studio Logo */}
        <div className="flex flex-col">
          <a href="#hero" className="group">
            <span className="text-xl sm:text-2xl font-serif font-semibold tracking-tight text-[#1F1E1D] group-hover:text-[#72202E] transition-colors">
              {profile.businessName || 'GlowBeauty Pro'}
            </span>
            <span className="block text-[10px] tracking-[0.25em] uppercase text-[#8C827A] font-sans font-medium -mt-1">
              Studio & Lash Design
            </span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-[0.18em] uppercase text-[#5A524C]">
          <a href="#hero" className="hover:text-[#72202E] transition-colors">Início</a>
          <a href="#servicios" className="hover:text-[#72202E] transition-colors">Serviços</a>
          <a href="#sobre-nosotros" className="hover:text-[#72202E] transition-colors">O Estúdio</a>
          <a href="#galeria" className="hover:text-[#72202E] transition-colors">Resultados</a>
          <a href="#contacto" className="hover:text-[#72202E] transition-colors">Localização</a>
        </nav>

        {/* Actions & CTA */}
        <div className="hidden sm:flex items-center gap-4">
          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full border border-[#D9D0C5] text-[#1F1E1D] hover:text-[#72202E] hover:border-[#72202E] transition-colors"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}

          <a
            href={`https://wa.me/${cleanPhoneNumber(profile.whatsapp)}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full border border-[#D9D0C5] text-[#1F1E1D] hover:text-[#128C7E] hover:border-[#128C7E] transition-colors"
            title="WhatsApp"
          >
            <Phone className="w-4 h-4" />
          </a>

          <button
            onClick={onBookClick}
            className="px-6 py-2.5 rounded-none bg-[#72202E] hover:bg-[#581520] text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all shadow-xs active:scale-[0.98]"
          >
            Agendar Horário
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onBookClick}
            className="px-3.5 py-1.5 rounded-none bg-[#72202E] text-white text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            Agendar
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1F1E1D]"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FBF9F5] border-b border-[#EAE3D9] px-6 py-6 space-y-4">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold uppercase tracking-[0.15em] text-[#1F1E1D]"
          >
            Início
          </a>
          <a
            href="#servicios"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold uppercase tracking-[0.15em] text-[#1F1E1D]"
          >
            Serviços
          </a>
          <a
            href="#sobre-nosotros"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold uppercase tracking-[0.15em] text-[#1F1E1D]"
          >
            O Estúdio
          </a>
          <a
            href="#galeria"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold uppercase tracking-[0.15em] text-[#1F1E1D]"
          >
            Resultados
          </a>
          <a
            href="#contacto"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold uppercase tracking-[0.15em] text-[#1F1E1D]"
          >
            Localização
          </a>

          <div className="pt-4 border-t border-[#EAE3D9] flex items-center gap-4">
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-[#5A524C]"
              >
                <Instagram className="w-4 h-4 text-[#72202E]" />
                <span>{profile.instagram}</span>
              </a>
            )}
            <a
              href={`https://wa.me/${cleanPhoneNumber(profile.whatsapp)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-[#5A524C]"
            >
              <Phone className="w-4 h-4 text-[#128C7E]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

