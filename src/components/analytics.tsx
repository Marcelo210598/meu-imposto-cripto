"use client";

import Script from "next/script";

// Configurações de Analytics
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  return (
    <>
      {/* Plausible Analytics (Privacy-friendly) */}
      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}

      {/* Google Analytics */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

// Hook para eventos customizados
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  // Plausible
  if (typeof window !== "undefined" && (window as unknown as { plausible?: (event: string, options?: { props: Record<string, string | number | boolean> }) => void }).plausible) {
    (window as unknown as { plausible: (event: string, options?: { props: Record<string, string | number | boolean> }) => void }).plausible(eventName, { props: props || {} });
  }

  // Google Analytics
  if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", eventName, props);
  }
}
