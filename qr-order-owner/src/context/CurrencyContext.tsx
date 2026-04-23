import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Types de devises supportées
export type Currency = 'XOF' | 'EUR' | 'USD';

// Configuration des devises
export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  decimals: number;
  position: 'before' | 'after'; // Position du symbole par rapport au montant
}

const currencyConfigs: Record<Currency, CurrencyConfig> = {
  XOF: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'Franc CFA',
    decimals: 0, // Le Franc CFA n'utilise généralement pas de décimales
    position: 'after',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    position: 'after',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dollar US',
    decimals: 2,
    position: 'before',
  },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
  currencyConfig: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Récupérer la devise depuis localStorage ou utiliser 'XOF' par défaut
    const savedCurrency = localStorage.getItem('qr_owner_currency') as Currency;
    return savedCurrency || 'XOF';
  });

  useEffect(() => {
    // Sauvegarder la devise dans localStorage
    localStorage.setItem('qr_owner_currency', currency);
  }, [currency]);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
  };

  // Fonction pour formater un prix selon la devise
  const formatPrice = (amount: number): string => {
    const config = currencyConfigs[currency];
    
    // Arrondir selon le nombre de décimales
    const roundedAmount = config.decimals === 0 
      ? Math.round(amount)
      : Number(amount.toFixed(config.decimals));
    
    // Formater le nombre avec séparateurs de milliers
    const formattedNumber = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(roundedAmount);
    
    // Positionner le symbole
    if (config.position === 'before') {
      return `${config.symbol}${formattedNumber}`;
    } else {
      return `${formattedNumber} ${config.symbol}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        currencyConfig: currencyConfigs[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
