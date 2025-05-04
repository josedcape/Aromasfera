import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RemixIcon } from '@/components/ui/remixicon';
import { useMobile } from '@/hooks/use-mobile';

interface BackgroundMusicProps {
  audioUrl: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
}

export default function BackgroundMusic({
  audioUrl,
  autoPlay = false,
  loop = true,
  volume = 0.5
}: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useMobile();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configurar audio
    audio.volume = currentVolume;
    audio.loop = loop;
    
    // Reproducir o pausar según estado
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error al reproducir audio:', error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentVolume, loop, audioUrl]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volume = newVolume[0];
    setCurrentVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Posición en la pantalla según dispositivo
  const positionClass = isMobile 
    ? "fixed top-20 right-4 z-40" 
    : "fixed top-6 right-6 z-40";

  return (
    <>
      <audio ref={audioRef} src={audioUrl} />
      
      <div className={positionClass}>
        <div className="flex flex-col items-end">
          {/* Botón principal */}
          <Button
            onClick={toggleControls}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md border-blue-400/30 text-white hover:bg-black/40 hover:text-blue-300"
          >
            <RemixIcon 
              name={showControls ? "close-line" : "music-2-line"} 
              size="lg" 
              className="text-blue-300" 
            />
          </Button>
          
          {/* Controles expandidos */}
          {showControls && (
            <div className="mt-2 p-3 bg-black/50 backdrop-blur-md rounded-xl border border-blue-400/20 flex flex-col gap-2 w-48 animate-in fade-in slide-in-from-top-5 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">Música Ambiente</span>
                <Button
                  onClick={togglePlay}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/10"
                >
                  <RemixIcon name={isPlaying ? "pause-fill" : "play-fill"} size="lg" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <RemixIcon name="volume-down-line" size="sm" className="text-white/70" />
                <Slider
                  defaultValue={[currentVolume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
                <RemixIcon name="volume-up-line" size="sm" className="text-white/70" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}