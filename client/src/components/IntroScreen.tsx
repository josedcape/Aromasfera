import { RemixIcon } from "@/components/ui/remixicon";
import { GenderType } from "@/lib/utils";
import ReactPlayer from "react-player/lazy";
import { useState } from "react";

interface IntroScreenProps {
  onGenderSelect: (gender: GenderType) => void;
  onSkip: () => void;
}

export default function IntroScreen({ onGenderSelect, onSkip }: IntroScreenProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <div className="relative w-full h-[66vh]">
        <div className="absolute inset-0 bg-neutral-dark opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ReactPlayer
            url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Replace with actual intro video URL
            width="100%"
            height="100%"
            playing={playing}
            controls={false}
            muted={true}
            config={{
              youtube: {
                playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
              }
            }}
            className="object-cover"
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="w-16 h-16 rounded-full bg-white bg-opacity-30 flex items-center justify-center backdrop-blur-sm border border-white border-opacity-50"
                onClick={() => setPlaying(true)}
              >
                <RemixIcon name="play-fill" className="text-white text-3xl" />
              </button>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black to-transparent">
          <h1 className="font-heading text-3xl font-bold mb-2">Discover Your Signature Scent</h1>
          <p className="font-body opacity-90">Our AI will guide you to the perfect fragrance that matches your personality.</p>
        </div>
      </div>

      <div className="p-6">
        <h2 className="font-heading text-xl font-semibold mb-4 text-center">Choose Your Experience</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            className="gender-btn relative overflow-hidden rounded-xl border border-neutral-200 shadow-sm group transition hover:shadow-md"
            onClick={() => onGenderSelect("men")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-primary/30 group-hover:opacity-100 opacity-0 transition-opacity"></div>
            <div className="w-full h-40 bg-neutral-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="p-3 text-center relative">
              <h3 className="font-accent font-medium">Men</h3>
            </div>
          </button>

          <button 
            className="gender-btn relative overflow-hidden rounded-xl border border-neutral-200 shadow-sm group transition hover:shadow-md"
            onClick={() => onGenderSelect("women")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-pink-500/30 group-hover:opacity-100 opacity-0 transition-opacity"></div>
            <div className="w-full h-40 bg-neutral-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1.5 20v-6h-2.5L9 8h6l1 8h-2.5v6h-3z"/>
              </svg>
            </div>
            <div className="p-3 text-center relative">
              <h3 className="font-accent font-medium">Women</h3>
            </div>
          </button>
        </div>

        <p className="text-neutral-medium text-sm text-center mb-6">
          Let our AI assistant help you find your perfect scent match based on your preferences.
        </p>

        <div className="flex justify-center">
          <button 
            className="text-primary font-medium text-sm flex items-center"
            onClick={onSkip}
          >
            <span>Skip Introduction</span>
            <RemixIcon name="arrow-right-line" className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
