import React, { useState } from 'react';
import { RemixIcon } from './ui/remixicon';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { exportAppAsDownloadablePackage } from '@/lib/exportService';
import { usePerfumeStore } from '@/store/perfumeStore';

interface DownloadAppModalProps {
  onClose: () => void;
}

export default function DownloadAppModal({ onClose }: DownloadAppModalProps) {
  const [downloadingProgress, setDownloadingProgress] = useState<number>(0);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  // Obtenemos el estado actual de preferencias del usuario
  const { userPreferences } = usePerfumeStore();

  const handleDownload = async () => {
    setDownloadStarted(true);
    
    // Iniciamos un simulador de progreso para UI
    const interval = setInterval(() => {
      setDownloadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Mantenemos en 90% hasta que termine el proceso real
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // Hacemos la exportación real con los datos del usuario
      const result = await exportAppAsDownloadablePackage(userPreferences, {
        exportDate: new Date().toISOString(),
        exportVersion: "1.0.0",
      });
      
      // Completamos la barra de progreso
      setDownloadingProgress(100);
      setDownloadComplete(true);
      clearInterval(interval);
      
      if (result) {
        toast({
          title: "¡Paquete exportado con éxito!",
          description: "Ahora puedes instalar AromaSfera en tu dispositivo",
        });
      }
    } catch (error) {
      console.error("Error en la exportación:", error);
      setDownloadingProgress(0);
      setDownloadStarted(false);
      clearInterval(interval);
      
      toast({
        title: "Error al exportar",
        description: "Ocurrió un problema durante la exportación",
        variant: "destructive",
      });
    }
  };

  const generateDownloadLink = async () => {
    // Esta función preparará los datos para exportar
    try {
      const appData = {
        name: "AromaSfera",
        version: "1.0.0",
        description: "Aplicación de recomendación de fragancias basada en IA",
        author: "AromaSfera Team",
        timestamp: new Date().toISOString(),
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        // Incluimos las preferencias del usuario
        userPreferences: userPreferences
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "aromasfera_config.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: "Archivo de configuración exportado",
        description: "Se ha descargado el archivo de configuración de AromaSfera",
      });
    } catch (error) {
      console.error("Error al generar el enlace de descarga", error);
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo de configuración",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 max-w-md w-full shadow-2xl animate-fadeIn relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-shimmer opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Descargar AromaSfera
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <RemixIcon name="close-line" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
                <RemixIcon name="download-cloud-line" size="2xl" className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">AromaSfera App</h3>
                <p className="text-gray-400 text-sm">Versión 1.0.0</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-gray-300 font-medium">Opciones de descarga:</h4>
              
              <div className="space-y-3">
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <RemixIcon name="smartphone-line" className="text-blue-400" />
                      </div>
                      <div>
                        <h5 className="text-gray-100 group-hover:text-white transition-colors">Exportar archivo de configuración</h5>
                        <p className="text-gray-500 text-xs">Descarga un archivo con la configuración de la app</p>
                      </div>
                    </div>
                    <button 
                      onClick={generateDownloadLink}
                      className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                    >
                      <RemixIcon name="download-line" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <RemixIcon name="code-box-line" className="text-purple-400" />
                      </div>
                      <div>
                        <h5 className="text-gray-100 group-hover:text-white transition-colors">Paquete de código fuente</h5>
                        <p className="text-gray-500 text-xs">Para desarrolladores o implementación personalizada</p>
                      </div>
                    </div>
                    {!downloadStarted ? (
                      <Button 
                        onClick={handleDownload}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/20"
                        size="sm"
                      >
                        <RemixIcon name="download-cloud-line" className="mr-1" />
                        Descargar
                      </Button>
                    ) : (
                      <div className="w-24">
                        {downloadComplete ? (
                          <div className="flex items-center space-x-1 text-green-400">
                            <RemixIcon name="check-line" />
                            <span className="text-xs">Completado</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                                style={{ width: `${downloadingProgress}%` }}
                              ></div>
                            </div>
                            <div className="text-gray-500 text-xs text-right">
                              {downloadingProgress}%
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <RemixIcon name="information-line" className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p>
                  También puedes crear un acceso directo añadiendo esta aplicación a tu pantalla de inicio desde el menú de tu navegador.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}