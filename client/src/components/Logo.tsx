import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export default function Logo({ size = 'md', className = '', animated = true }: LogoProps) {
  // Definir tamaños
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };
  
  const sizeClass = sizes[size];
  
  return (
    <div className={`${sizeClass} relative ${className}`}>
      {/* Efecto de resplandor */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#6610f2] to-[#e83e8c] opacity-70 blur-md ${animated ? 'animate-pulse' : ''}`}></div>
      
      {/* Contenedor del logo */}
      <div className="relative w-full h-full rounded-full overflow-hidden">
        {/* Imagen del logo */}
        <img 
          src="/images/aromasfera-logo.png" 
          alt="AromaSfera Logo" 
          className="w-full h-full object-contain relative z-10"
        />
        
        {/* Efecto de brillo */}
        {animated && <div className="absolute inset-0 shine-effect"></div>}
        
        {/* Borde decorativo */}
        <div className="absolute inset-0 rounded-full border border-[#16deca] opacity-50"></div>
      </div>
    </div>
  );
}