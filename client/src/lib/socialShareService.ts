import { Perfume } from './utils';

/**
 * Tipos de redes sociales soportadas
 */
export type SocialNetwork = 
  'facebook' | 
  'twitter' | 
  'instagram' | 
  'whatsapp' | 
  'pinterest' | 
  'linkedin' | 
  'telegram' | 
  'email';

/**
 * Opciones para compartir en redes sociales
 */
export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  image?: string;
  hashtags?: string[];
  via?: string;
}

/**
 * Configuración personalizada para cada red social
 */
interface SocialConfig {
  name: string;
  color: string;
  icon: string;
  shareUrl: (options: ShareOptions) => string;
  popupDimensions?: { width: number; height: number };
}

/**
 * Configuraciones para diferentes redes sociales
 */
const socialConfigs: Record<SocialNetwork, SocialConfig> = {
  facebook: {
    name: 'Facebook',
    color: '#1877f2',
    icon: 'facebook-fill',
    shareUrl: (options) => {
      const url = encodeURIComponent(options.url || window.location.href);
      const quote = encodeURIComponent(options.text || '');
      return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
    },
    popupDimensions: { width: 670, height: 340 }
  },
  twitter: {
    name: 'Twitter',
    color: '#000000',
    icon: 'twitter-x-fill',
    shareUrl: (options) => {
      const url = encodeURIComponent(options.url || window.location.href);
      const text = encodeURIComponent(options.text || '');
      const hashtags = options.hashtags?.join(',') || '';
      const via = options.via || '';
      
      return `https://twitter.com/intent/tweet?url=${url}&text=${text}${hashtags ? `&hashtags=${hashtags}` : ''}${via ? `&via=${via}` : ''}`;
    },
    popupDimensions: { width: 550, height: 420 }
  },
  instagram: {
    name: 'Instagram',
    color: '#e1306c',
    icon: 'instagram-fill',
    shareUrl: () => 'instagram://camera',
    // Instagram no tiene una API real para compartir, normalmente hay que usar la app
  },
  whatsapp: {
    name: 'WhatsApp',
    color: '#25d366',
    icon: 'whatsapp-fill',
    shareUrl: (options) => {
      const text = encodeURIComponent((options.text || '') + ' ' + (options.url || window.location.href));
      return `https://api.whatsapp.com/send?text=${text}`;
    }
  },
  pinterest: {
    name: 'Pinterest',
    color: '#bd081c',
    icon: 'pinterest-fill',
    shareUrl: (options) => {
      const url = encodeURIComponent(options.url || window.location.href);
      const description = encodeURIComponent(options.text || '');
      const media = encodeURIComponent(options.image || '');
      
      return `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`;
    },
    popupDimensions: { width: 750, height: 550 }
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0077b5',
    icon: 'linkedin-fill',
    shareUrl: (options) => {
      const url = encodeURIComponent(options.url || window.location.href);
      const title = encodeURIComponent(options.title || '');
      const summary = encodeURIComponent(options.text || '');
      
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    },
    popupDimensions: { width: 750, height: 600 }
  },
  telegram: {
    name: 'Telegram',
    color: '#0088cc',
    icon: 'telegram-fill',
    shareUrl: (options) => {
      const url = options.url || window.location.href;
      const text = options.text || '';
      
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    },
    popupDimensions: { width: 550, height: 420 }
  },
  email: {
    name: 'Email',
    color: '#777777',
    icon: 'mail-fill',
    shareUrl: (options) => {
      const subject = encodeURIComponent(options.title || '');
      const body = encodeURIComponent((options.text || '') + '\n\n' + (options.url || window.location.href));
      
      return `mailto:?subject=${subject}&body=${body}`;
    }
  }
};

/**
 * Función para generar un texto de compartir basado en la información de un perfume
 * @param perfume Datos del perfume a compartir (opcional)
 * @returns Texto formateado para compartir
 */
export function generateShareText(perfume?: Perfume): string {
  if (perfume) {
    return `¡Encontré mi perfume ideal con AromaSfera! ${perfume.name} de ${perfume.brand} - ${perfume.matchPercentage}% match con mi personalidad. ¡Descubre el tuyo!`;
  }
  
  return '¡Descubre tu perfume ideal con AromaSfera, el asistente AI que te recomienda fragancias a tu medida!';
}

/**
 * Función para compartir en una red social específica
 * @param network Red social en la que compartir
 * @param options Opciones de compartir personalizadas
 */
export function shareOnSocial(network: SocialNetwork, options: ShareOptions = {}): void {
  const config = socialConfigs[network];
  if (!config) return;
  
  const shareUrl = config.shareUrl(options);
  
  if (network === 'email') {
    // El correo electrónico utiliza el protocolo mailto:, que se maneja de forma diferente
    window.location.href = shareUrl;
    return;
  }
  
  if (network === 'instagram') {
    // Instagram requiere tratamiento especial ya que no tiene API de compartir
    try {
      // Intenta abrir la app de Instagram
      window.location.href = 'instagram://camera';
      
      // Como respaldo, abre el sitio web de Instagram
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 1000);
    } catch (error) {
      window.open('https://www.instagram.com/', '_blank');
    }
    return;
  }
  
  // Para otras redes sociales, abrimos una ventana popup
  if (config.popupDimensions) {
    const { width, height } = config.popupDimensions;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      shareUrl,
      `share-${network}`,
      `width=${width},height=${height},left=${left},top=${top},location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1`
    );
  } else {
    window.open(shareUrl, '_blank');
  }
}

/**
 * Función para generar una URL de tracking específica para redes sociales
 * @param baseUrl URL base
 * @param network Red social de origen
 * @param campaign Nombre de la campaña (opcional)
 * @returns URL con parámetros UTM para tracking
 */
export function generateTrackingUrl(baseUrl: string, network: SocialNetwork, campaign: string = 'social_share'): string {
  const url = new URL(baseUrl);
  
  // Añadir parámetros UTM para tracking
  url.searchParams.append('utm_source', network);
  url.searchParams.append('utm_medium', 'social');
  url.searchParams.append('utm_campaign', campaign);
  
  return url.toString();
}

/**
 * Función para copiar un texto al portapapeles
 * @param text Texto a copiar
 * @returns Promise que resuelve a true si se copió correctamente
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
}

/**
 * Función para generar el HTML de un widget de compartir que se puede insertar en otras páginas
 * @param options Opciones de configuración del widget
 * @returns Código HTML del widget
 */
export function generateShareWidget(options: {
  url?: string;
  title?: string;
  text?: string;
  networks?: SocialNetwork[];
  theme?: 'light' | 'dark';
}): string {
  const { 
    url = window.location.href,
    title = 'AromaSfera - Tu asistente de fragancias',
    text = 'Descubre tu perfume ideal con ayuda de la inteligencia artificial',
    networks = ['facebook', 'twitter', 'whatsapp', 'pinterest', 'linkedin'],
    theme = 'light'
  } = options;
  
  // Estilos básicos para el widget
  const bgColor = theme === 'light' ? '#ffffff' : '#1e1e2e';
  const textColor = theme === 'light' ? '#333333' : '#ffffff';
  const borderColor = theme === 'light' ? '#e2e8f0' : '#2d2d3d';
  
  // Crear botones para cada red social
  const buttons = networks.map(network => {
    const config = socialConfigs[network];
    if (!config) return '';
    
    return `
      <a href="${config.shareUrl({ url, text, title })}" target="_blank" rel="noopener noreferrer" 
         style="display:inline-block; margin:5px; width:40px; height:40px; border-radius:20px; background-color:${config.color}; color:white; text-align:center; line-height:40px; text-decoration:none;">
        <i class="ri-${config.icon}"></i>
      </a>
    `;
  }).join('');
  
  // HTML completo del widget
  return `
    <div class="aromasfera-share-widget" style="font-family:system-ui,-apple-system,sans-serif; padding:15px; border-radius:8px; background-color:${bgColor}; color:${textColor}; border:1px solid ${borderColor}; max-width:400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="margin-bottom:10px; font-weight:bold;">${title}</div>
      <p style="margin-bottom:15px; font-size:14px;">${text}</p>
      <div style="display:flex; flex-wrap:wrap; justify-content:center;">
        ${buttons}
      </div>
      <div style="margin-top:10px; font-size:12px; text-align:center; color:${theme === 'light' ? '#718096' : '#a0aec0'};">
        Powered by <a href="https://aromasfera.example.com" style="color:${theme === 'light' ? '#805ad5' : '#b794f4'}; text-decoration:none;">AromaSfera</a>
      </div>
    </div>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
  `;
}