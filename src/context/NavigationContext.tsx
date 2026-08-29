import React, { createContext, useContext, useState } from 'react';

export type AdminSection = 
  | 'overview' 
  | 'patients' 
  | 'appointments' 
  | 'doctors' 
  | 'wards' 
  | 'billing' 
  | 'staff' 
  | 'database';

interface NavigationContextValue {
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  activeModal: string | null;
  openModal: (modalName: string | null) => void;
  closeModal: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openModal = (modalName: string | null) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <NavigationContext.Provider
      value={{
        activeSection,
        setActiveSection,
        activeModal,
        openModal,
        closeModal,
        isChatOpen,
        setIsChatOpen,
        toggleChat,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
