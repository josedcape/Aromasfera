import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-3 bg-black/80 backdrop-blur-md text-white text-center fixed bottom-0 z-30">
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <img 
          src="/images/logo.jpg" 
          alt="Botidinamix Logo" 
          className="w-6 h-6 rounded-full border border-blue-400 shadow-lg shadow-blue-500/50"
        />
        <p className="text-xs font-medium">
          Botidinamix AI © Todos los derechos reservados 2025
        </p>
      </div>
    </footer>
  );
}