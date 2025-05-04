import { RemixIcon } from "@/components/ui/remixicon";
import { Perfume, formatPrice, formatMatch } from "@/lib/utils";
import { useState } from "react";

interface PerfumeCardProps {
  perfume: Perfume;
}

export default function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4 border border-neutral-200">
      <div className="flex">
        <div className="w-1/3">
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M9 10h6v4H9z" />
              <path d="M12 2v5" />
            </svg>
          </div>
        </div>
        <div className="w-2/3 p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-heading font-semibold">{perfume.name}</h3>
              <p className="text-xs text-neutral-medium">{perfume.brand}</p>
            </div>
            <div className="bg-accent text-neutral-dark text-xs font-bold px-2 py-1 rounded-full">
              {formatMatch(perfume.matchPercentage)}
            </div>
          </div>
          
          <div className="flex items-center mt-2 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                if (i < Math.floor(perfume.rating)) {
                  return <RemixIcon key={i} name="star-fill" className="text-accent text-sm" />;
                } else if (i === Math.floor(perfume.rating) && perfume.rating % 1 >= 0.5) {
                  return <RemixIcon key={i} name="star-half-fill" className="text-accent text-sm" />;
                } else {
                  return <RemixIcon key={i} name="star-line" className="text-accent text-sm" />;
                }
              })}
            </div>
            <span className="text-xs ml-1">{perfume.rating.toFixed(1)} ({perfume.reviews})</span>
          </div>
          
          <p className="text-xs mt-1 line-clamp-2">
            {perfume.description}
          </p>
          
          <div className="flex items-center justify-between mt-3">
            <span className="font-semibold">{formatPrice(perfume.price)}</span>
            <div className="flex space-x-2">
              <button 
                className="w-8 h-8 rounded-full bg-neutral-light flex items-center justify-center"
                onClick={toggleFavorite}
              >
                <RemixIcon 
                  name={isFavorite ? "heart-fill" : "heart-line"} 
                  className={isFavorite ? "text-secondary" : "text-neutral-medium"} 
                />
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded-full text-sm">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
