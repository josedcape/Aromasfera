import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary animate-fadeIn">
      <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg">
        <svg className="w-full h-full" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
          <circle cx="64" cy="64" r="60" fill="white" />
          <path d="M64 30c-19.33 0-35 15.67-35 35 0 19.33 15.67 35 35 35s35-15.67 35-35c0-19.33-15.67-35-35-35zm0 60c-13.81 0-25-11.19-25-25s11.19-25 25-25 25 11.19 25 25-11.19 25-25 25z" fill="#8A2BE2" />
          <path d="M64 50c-8.28 0-15 6.72-15 15 0 8.28 6.72 15 15 15s15-6.72 15-15c0-8.28-6.72-15-15-15zm0 20c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#8A2BE2" />
          <path d="M64 40c-13.81 0-25 11.19-25 25 0 13.81 11.19 25 25 25s25-11.19 25-25c0-13.81-11.19-25-25-25zm0 40c-8.28 0-15-6.72-15-15s6.72-15 15-15 15 6.72 15 15-6.72 15-15 15z" fill="#8A2BE2" opacity="0.7" />
        </svg>
      </div>
      <h1 className="font-heading text-3xl text-white font-bold tracking-wide mb-2">AromaSfera</h1>
      <p className="font-accent text-white text-sm opacity-80">Your personalized fragrance journey</p>
    </div>
  );
}
