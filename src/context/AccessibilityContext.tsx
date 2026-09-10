import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  fontScale: number; // 1 = 100%, 1.15 = 115%, 1.3 = 130%
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  resetFontScale: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem('nexo-font-scale');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale));
    localStorage.setItem('nexo-font-scale', String(fontScale));
  }, [fontScale]);

  const increaseFontScale = () => {
    setFontScale((prev) => Math.min(prev + 0.15, 1.45));
  };

  const decreaseFontScale = () => {
    setFontScale((prev) => Math.max(prev - 0.15, 0.85));
  };

  const resetFontScale = () => {
    setFontScale(1);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        increaseFontScale,
        decreaseFontScale,
        resetFontScale,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
