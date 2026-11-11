import React from 'react';
import { BeautyProProfile, BeautyService, Appointment, AppLanguage } from '../types';
import { AiClientAssistant } from './AiClientAssistant';

interface AiClientAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BeautyProProfile;
  services: BeautyService[];
  appointments?: Appointment[];
  preselectedAppointment?: Appointment | null;
  lang?: AppLanguage;
}

export const AiClientAssistantModal: React.FC<AiClientAssistantModalProps> = ({
  isOpen,
  onClose,
  profile,
  services,
  appointments = [],
  preselectedAppointment = null,
  lang = 'pt'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col">
        <div className="p-4 sm:p-6 overflow-y-auto">
          <AiClientAssistant
            profile={profile}
            services={services}
            appointments={appointments}
            preselectedAppointment={preselectedAppointment}
            onClose={onClose}
            isModal={true}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
};
