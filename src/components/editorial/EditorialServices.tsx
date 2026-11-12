import React, { useState } from 'react';
import { BeautyService, ServiceCategory, CurrencyCode } from '../../types';
import { Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatPrice } from '../../utils/i18n';

interface EditorialServicesProps {
  services: BeautyService[];
  currency: CurrencyCode;
  onSelectService: (service: BeautyService) => void;
  onBookClick: () => void;
}

const CATEGORY_TABS: { id: ServiceCategory | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pestañas', label: 'Pestañas' },
  { id: 'cejas', label: 'Cejas' },
  { id: 'uñas', label: 'Uñas' },
  { id: 'facial', label: 'Facial' },
  { id: 'maquillaje', label: 'Maquillaje' }
];

export const EditorialServices: React.FC<EditorialServicesProps> = ({
  services,
  currency,
  onSelectService,
  onBookClick
}) => {
  const [activeTab, setActiveTab] = useState<ServiceCategory | 'todos'>('todos');

  const activeServices = services.filter((s) => s.isActive);
  const filteredServices =
    activeTab === 'todos'
      ? activeServices
      : activeServices.filter((s) => s.category === activeTab);

  return (
    <section id="servicios" className="py-20 bg-[#F4EFEB] border-t border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#72202E] font-semibold block">
              Nuestros Servicios Exclusivos
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#1F1E1D] uppercase leading-tight">
              Everything you need for
              <span className="font-script-luxury text-4xl sm:text-6xl text-[#72202E] lowercase block mt-1">
                complete beauty
              </span>
            </h2>
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed">
              Desde extensiones de pestañas de efecto natural y diseño de cejas visagista, hasta uñas y tratamientos faciales con tecnología de vanguardia.
            </p>
            <button
              onClick={onBookClick}
              className="px-6 py-2.5 bg-[#72202E] hover:bg-[#581520] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
            >
              Ver Turnos Disponibles
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E3DACF]">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all whitespace-nowrap border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-[#72202E] text-[#72202E]'
                  : 'border-transparent text-[#7A7169] hover:text-[#1F1E1D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Grid (Editorial Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => {
            const indexStr = (index + 1).toString().padStart(2, '0');

            return (
              <div
                key={service.id}
                className="group bg-[#FBF9F5] border border-[#E3DACF] flex flex-col justify-between overflow-hidden transition-all hover:border-[#72202E] hover:shadow-xl"
              >
                {/* Photo & Number Tag */}
                <div className="relative h-64 w-full overflow-hidden bg-[#EAE3D9]">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-[#C4A480]">
                      ✨
                    </div>
                  )}

                  {/* Top Tags */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[11px] font-semibold tracking-wider text-[#1F1E1D] uppercase">
                      {indexStr} {service.category}
                    </span>
                    {service.popular && (
                      <span className="px-2.5 py-1 bg-[#72202E] text-white text-[10px] font-bold uppercase tracking-widest">
                        Destacado
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-semibold text-[#1F1E1D] group-hover:text-[#72202E] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#5A524C] line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Duration, Price & CTA */}
                  <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#7A7169]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{service.durationMinutes} min</span>
                      </div>
                      <div className="text-lg font-serif font-bold text-[#1F1E1D]">
                        {formatPrice(service.price, currency)}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectService(service)}
                      className="px-4 py-2 bg-[#1F1E1D] group-hover:bg-[#72202E] text-white text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors flex items-center gap-1.5"
                    >
                      <span>Reservar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
