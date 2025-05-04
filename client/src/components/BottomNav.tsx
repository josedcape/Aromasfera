import { useState } from "react";
import { RemixIcon } from "@/components/ui/remixicon";
import DownloadAppModal from "./DownloadAppModal";

export default function BottomNav() {
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10 max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          <button className="flex flex-col items-center p-2">
            <RemixIcon name="home-5-line" className="text-xl text-primary" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button className="flex flex-col items-center p-2">
            <RemixIcon name="search-line" className="text-xl text-neutral-medium" />
            <span className="text-xs mt-1">Explore</span>
          </button>
          
          <button 
            className="flex flex-col items-center p-2 relative group"
            onClick={() => setShowDownloadModal(true)}
          >
            <div className="absolute top-0 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <RemixIcon 
              name="download-cloud-line" 
              className="text-xl text-blue-500 group-hover:scale-110 transition-transform" 
            />
            <span className="text-xs mt-1 text-blue-500">Descargar</span>
          </button>
          
          <button className="flex flex-col items-center p-2">
            <RemixIcon name="user-line" className="text-xl text-neutral-medium" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* Modal de descarga */}
      {showDownloadModal && (
        <DownloadAppModal onClose={() => setShowDownloadModal(false)} />
      )}
    </>
  );
}
