import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
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
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 opacity-70 blur-md animate-pulse"></div>
      <div className="relative w-full h-full rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-cyan-300 shadow-xl">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <img 
            src="/images/logo.jpg" 
            alt="Botidinamix Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 rounded-full border border-blue-300 opacity-50"></div>
      </div>
    </div>
  );
}