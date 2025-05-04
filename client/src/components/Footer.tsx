import React from 'react';
import { useMobile } from '@/hooks/use-mobile';

export default function Footer() {
  const isMobile = useMobile();

  // Footer más compacto para móviles
  const footerClasses = `w-full ${isMobile ? 'py-2' : 'py-3'} bg-[#36219c]/90 backdrop-blur-md text-white text-center fixed bottom-0 z-30 border-t border-[#16deca]/30`;
  
  return (
    <footer className={footerClasses}>
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <img 
          src="/images/aromasfera-logo.png" 
          alt="AromaSfera Logo" 
          className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full shadow-lg shadow-pink-500/30`}
        />
        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium font-accent`}>
          {isMobile ? 'AromaSfera © 2025' : 'AromaSfera © Todos los derechos reservados 2025'}
        </p>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#16deca]/50 to-transparent"></div>
    </footer>
  );
}