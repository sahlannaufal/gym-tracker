import Script from "next/script";

const ADSENSE_CLIENT = "ca-pub-9272067329159734";

// Skrip hanya dimuat di layout blog pada production. Tidak ada Auto Ads atau
// unit iklan pada layar pencatatan latihan dan halaman aplikasi.
export default function BlogAdSense() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
