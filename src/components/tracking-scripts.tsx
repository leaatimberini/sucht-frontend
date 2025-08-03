// frontend/src/components/tracking-scripts.tsx

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import api from '@/lib/axios';
import Image from 'next/image'; // CORRECCIÓN: Importamos el componente Image

export function TrackingScripts() {
  const [keys, setKeys] = useState({
    googleAnalyticsId: '',
    metaPixelId: '',
  });

  useEffect(() => {
    const fetchTrackingKeys = async () => {
      try {
        const response = await api.get('/configuration');
        if (response.data) {
          setKeys({
            googleAnalyticsId: response.data.googleAnalyticsId || '',
            metaPixelId: response.data.metaPixelId || '',
          });
        }
      } catch (error) {
        console.error('Could not fetch tracking keys.', error);
      }
    };

    fetchTrackingKeys();
  }, []);

  return (
    <>
      {/* --- Script de Google Analytics (gtag.js) --- */}
      {keys.googleAnalyticsId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${keys.googleAnalyticsId}`}
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${keys.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* --- Script de Meta Pixel (Facebook) --- */}
      {keys.metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${keys.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          {/* CORRECCIÓN: Usamos el componente <Image /> en lugar de <img> */}
          <noscript>
            <Image
              height={1}
              width={1}
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${keys.metaPixelId}&ev=PageView&noscript=1`}
              alt="Meta Pixel"
            />
          </noscript>
        </>
      )}
    </>
  );
}