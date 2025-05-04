import React from 'react';
import { cn } from '@/lib/utils';

// Tipos de tamaños disponibles
type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface RemixIconProps {
  name: string;
  size?: IconSize;
  className?: string;
}

export function RemixIcon({ 
  name, 
  size = 'md', 
  className 
}: RemixIconProps) {
  // Mapeo de tamaños a clases
  const sizeClasses = {
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };
  
  return (
    <i className={cn(
      `ri-${name}`,
      sizeClasses[size],
      className
    )}></i>
  );
}