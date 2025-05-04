import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RemixIcon } from '@/components/ui/remixicon';

interface BackgroundMusicProps {
  audioUrl: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
}

export default function BackgroundMusic({
  audioUrl,
  autoPlay = true,
  loop = true,
  volume = 0.3
}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Crear elemento de audio
    const audio = new Audio(audioUrl);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';
    
    // Guardar referencia
    audioRef.current = audio;
    setAudioElement(audio);
    
    // Configurar eventos
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    
    // Intentar reproducir si autoPlay está habilitado
    if (autoPlay) {
      // Las políticas de navegadores modernos requieren interacción del usuario
      // antes de reproducir audio automáticamente
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Reproducción automática exitosa
          setIsPlaying(true);
        }).catch(error => {
          // La reproducción automática no fue permitida
          console.log('Autoplay not allowed:', error);
          setIsPlaying(false);
        });
      }
    }
    
    // Cleanup al desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl, autoPlay, loop, volume]);
  
  // Controlar reproducción/pausa
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };
  
  // Controlar mute/unmute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-center">
      <div className="bg-black/30 backdrop-blur-md p-2 rounded-full shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:from-purple-500 hover:to-indigo-600"
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          <RemixIcon name={isPlaying ? "pause-fill" : "play-fill"} size="xl" />
        </Button>
      </div>
      
      {isPlaying && (
        <div className="mt-2 bg-black/30 backdrop-blur-md p-2 rounded-full shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-gray-950"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <RemixIcon name={isMuted ? "volume-mute-fill" : "volume-up-fill"} />
          </Button>
        </div>
      )}
    </div>
  );
}