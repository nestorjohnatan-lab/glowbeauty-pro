import React from 'react';
import { ProTab, AppLanguage } from '../types';
import { Calendar, Scissors, MessageSquare, Instagram } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

interface ProBottomNavProps {
  currentTab: ProTab;
  onSelectTab: (tab: ProTab) => void;
  todayCount?: number;
  pendingAlertsCount?: number;
  lang?: AppLanguage;
}

export const ProBottomNav: React.FC<ProBottomNavProps> = ({
  currentTab,
  onSelectTab,
  todayCount = 0,
  pendingAlertsCount = 0,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  const NAV_ITEMS: { id: ProTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'agenda',
      label: t.navAgenda,
      icon: <Calendar className="w-5 h-5" />,
      badge: todayCount > 0 ? todayCount : undefined
    },
    {
      id: 'services',
      label: t.navServices,
      icon: <Scissors className="w-5 h-5" />
    },
    {
      id: 'alerts',
      label: t.navAlerts,
      icon: <MessageSquare className="w-5 h-5" />,
      badge: pendingAlertsCount > 0 ? pendingAlertsCount : undefined
    },
    {
      id: 'social_profile',
      label: t.navSocial,
      icon: <Instagram className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-t border-[#EAE3D9] pb-safe shadow-lg">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-w-[56px] relative transition-colors ${
                isActive ? 'text-[#72202E]' : 'text-[#7A7169] hover:text-[#1F1E1D]'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#72202E] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium truncate max-w-[64px] ${
                  isActive ? 'text-[#72202E] font-bold' : 'text-[#7A7169]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-[#72202E] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
