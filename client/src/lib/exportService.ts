import { toast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Servicio para exportar la aplicación como un archivo descargable
 */

export async function exportAppAsDownloadablePackage(userPreferences: any, appData: any = {}) {
  try {
    const zip = new JSZip();
    
    // Agregar archivos básicos para la instalación
    zip.file("README.md", generateReadme());
    zip.file("app-config.json", JSON.stringify({
      name: "AromaSfera",
      version: "1.0.0",
      description: "Aplicación de recomendación de fragancias basada en IA",
      preferences: userPreferences,
      timestamp: new Date().toISOString(),
      ...appData
    }, null, 2));

    // Agregar un directorio para datos
    const dataDir = zip.folder("data");
    if (dataDir) {
      dataDir.file("preferences.json", JSON.stringify(userPreferences, null, 2));
      dataDir.file("app-state.json", JSON.stringify({
        lastUsed: new Date().toISOString(),
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language
      }, null, 2));
    }

    // Generar archivo de instalación ficticio (para ilustración)
    const installDir = zip.folder("install");
    if (installDir) {
      installDir.file("install.sh", generateInstallScript());
      installDir.file("install.bat", generateWindowsInstallScript());
    }

    // Generar archivo PWA
    const pwaDir = zip.folder("pwa");
    if (pwaDir) {
      pwaDir.file("manifest.json", generatePWAManifest());
      pwaDir.file("service-worker.js", generateServiceWorker());
      pwaDir.file("instructions.html", generatePWAInstructions());
    }

    // Generar el archivo ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Descargar el archivo
    saveAs(content, "aromasfera-app.zip");
    
    return true;
  } catch (error) {
    console.error("Error al exportar la aplicación:", error);
    toast({
      title: "Error al exportar",
      description: "No se pudo generar el archivo de exportación",
      variant: "destructive",
    });
    return false;
  }
}

// Funciones auxiliares para generar contenido de archivos
function generateReadme() {
  return `# AromaSfera - Tu asistente de fragancias personal

## Guía de inicio rápido

Esta aplicación te ayuda a encontrar la fragancia perfecta basada en tus preferencias personales utilizando inteligencia artificial avanzada.

### Instalación

1. Para instalar como aplicación web (PWA):
   - Abre la carpeta 'pwa' y sigue las instrucciones en 'instructions.html'
   
2. Para instalar como aplicación nativa:
   - En Linux/Mac: Ejecuta el script 'install.sh' en la carpeta 'install'
   - En Windows: Ejecuta el archivo 'install.bat' en la carpeta 'install'

### Configuración

Todos tus datos de preferencias se encuentran en la carpeta 'data'.

### Soporte

Para obtener ayuda, visita nuestro sitio web: https://aromasfera.example.com

© ${new Date().getFullYear()} AromaSfera - Todos los derechos reservados
`;
}

function generateInstallScript() {
  return `#!/bin/bash
# Script de instalación para AromaSfera

echo "Iniciando instalación de AromaSfera..."
echo "Creando directorio de la aplicación..."
mkdir -p ~/.aromasfera

echo "Copiando archivos..."
cp -r ../data ~/.aromasfera/

echo "Creando acceso directo..."
echo "[Desktop Entry]
Name=AromaSfera
Exec=xdg-open https://aromasfera.example.com
Icon=~/.aromasfera/icon.png
Type=Application
Categories=Utility;" > ~/.local/share/applications/aromasfera.desktop

echo "¡Instalación completada!"
echo "Puedes abrir AromaSfera desde tu menú de aplicaciones."
`;
}

function generateWindowsInstallScript() {
  return `@echo off
echo Iniciando instalación de AromaSfera...
echo Creando directorio de la aplicación...
mkdir "%USERPROFILE%\\AromaSfera"

echo Copiando archivos...
xcopy ..\\data "%USERPROFILE%\\AromaSfera\\data" /E /I

echo Creando acceso directo...
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\\shortcut.vbs"
echo sLinkFile = "%USERPROFILE%\\Desktop\\AromaSfera.lnk" >> "%TEMP%\\shortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\\shortcut.vbs"
echo oLink.TargetPath = "https://aromasfera.example.com" >> "%TEMP%\\shortcut.vbs"
echo oLink.Save >> "%TEMP%\\shortcut.vbs"
cscript "%TEMP%\\shortcut.vbs"
del "%TEMP%\\shortcut.vbs"

echo ¡Instalación completada!
echo Puedes abrir AromaSfera desde el acceso directo en tu escritorio.
pause
`;
}

function generatePWAManifest() {
  return JSON.stringify({
    "name": "AromaSfera",
    "short_name": "AromaSfera",
    "description": "Tu asistente de fragancias personal",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1e1e2e",
    "theme_color": "#8b5cf6",
    "icons": [
      {
        "src": "/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }, null, 2);
}

function generateServiceWorker() {
  return `// Service Worker para AromaSfera
const CACHE_NAME = 'aromasfera-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
`;
}

function generatePWAInstructions() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Instrucciones para instalar AromaSfera como PWA</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #8b5cf6;
    }
    h2 {
      color: #6d28d9;
      margin-top: 30px;
    }
    .instruction {
      margin-bottom: 20px;
      padding-left: 20px;
      border-left: 3px solid #8b5cf6;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,.1);
    }
    code {
      background-color: #f1f1f1;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>Instrucciones para instalar AromaSfera como PWA</h1>
  
  <p>Una PWA (Progressive Web App) te permite instalar AromaSfera como una aplicación en tu dispositivo, con acceso desde tu pantalla de inicio y funcionalidad sin conexión.</p>
  
  <h2>En Chrome (Android/Desktop)</h2>
  
  <div class="instruction">
    <ol>
      <li>Abre <a href="https://aromasfera.example.com">aromasfera.example.com</a> en Chrome</li>
      <li>Haz clic en el icono de tres puntos en la esquina superior derecha</li>
      <li>Selecciona "Instalar aplicación" o "Añadir a la pantalla de inicio"</li>
      <li>Sigue las instrucciones en pantalla</li>
    </ol>
  </div>
  
  <h2>En Safari (iOS)</h2>
  
  <div class="instruction">
    <ol>
      <li>Abre <a href="https://aromasfera.example.com">aromasfera.example.com</a> en Safari</li>
      <li>Toca el icono de "Compartir" (un cuadrado con una flecha hacia arriba)</li>
      <li>Desplázate hacia abajo y selecciona "Añadir a pantalla de inicio"</li>
      <li>Dale un nombre y toca "Añadir"</li>
    </ol>
  </div>
  
  <h2>Configuración manual (Avanzado)</h2>
  
  <p>Si deseas configurar manualmente la PWA en tu sitio web:</p>
  
  <div class="instruction">
    <ol>
      <li>Copia el archivo <code>manifest.json</code> a la raíz de tu servidor web</li>
      <li>Copia el archivo <code>service-worker.js</code> a la raíz de tu servidor web</li>
      <li>Añade los íconos necesarios</li>
      <li>Agrega el siguiente código en el <code>&lt;head&gt;</code> de tu HTML:
        <pre><code>&lt;link rel="manifest" href="/manifest.json"&gt;
&lt;meta name="theme-color" content="#8b5cf6"&gt;
&lt;script&gt;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
&lt;/script&gt;</code></pre>
      </li>
    </ol>
  </div>
  
  <h2>Soporte</h2>
  
  <p>Si tienes problemas con la instalación, visita nuestra <a href="https://aromasfera.example.com/support">página de soporte</a> o contacta con nosotros en <a href="mailto:support@aromasfera.example.com">support@aromasfera.example.com</a>.</p>
  
  <footer style="margin-top: 50px; text-align: center; color: #666;">
    <p>&copy; ${new Date().getFullYear()} AromaSfera - Todos los derechos reservados</p>
  </footer>
</body>
</html>
`;
}