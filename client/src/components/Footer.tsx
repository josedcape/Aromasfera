import React from 'react';
import { useMobile } from '@/hooks/use-mobile';

export default function Footer() {
  const isMobile = useMobile();

  // Footer más compacto para móviles
  const footerClasses = `w-full ${isMobile ? 'py-2' : 'py-3'} bg-black/80 backdrop-blur-md text-white text-center fixed bottom-0 z-30`;
  
  return (
    <footer className={footerClasses}>
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <img 
          src="/images/logo.jpg" 
          alt="Botidinamix Logo" 
          className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full border border-blue-400 shadow-lg shadow-blue-500/50`}
        />
        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium`}>
          {isMobile ? 'Botidinamix AI © 2025' : 'Botidinamix AI © Todos los derechos reservados 2025'}
        </p>
      </div>
    </footer>
  );
}