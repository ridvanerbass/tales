/**
 * Ziyaretçi bilgilerini takip eder
 */
export async function trackVisitor() {
  try {
    // Eğer API endpoint'i mevcut değilse veya geliştirme ortamındaysa
    // sessizce başarılı olarak dön
    if (typeof window === "undefined") {
      return { success: true };
    }

    // Tarayıcı bilgilerini al
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const referrer = document.referrer;
    const page = window.location.pathname;

    // IP adresini ve ülke bilgisini almak için harici bir servis kullan
    let ip = "127.0.0.1";
    let country = "Unknown";

    try {
      // Use a more reliable IP API with caching
      const cachedIp = sessionStorage.getItem("visitor_ip");
      const cachedCountry = sessionStorage.getItem("visitor_country");

      if (cachedIp && cachedCountry) {
        ip = cachedIp;
        country = cachedCountry;
      } else {
        // IP bilgisini almak için ipify API kullan
        const ipResponse = await fetch("https://api.ipify.org?format=json", {
          method: "GET",
          cache: "force-cache",
        }).catch(() => null);

        if (ipResponse && ipResponse.ok) {
          const ipData = await ipResponse.json();
          ip = ipData.ip;

          // Ülke bilgisini almak için ipapi.co kullan
          const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
            method: "GET",
            cache: "force-cache",
          }).catch(() => null);

          if (geoResponse && geoResponse.ok) {
            const geoData = await geoResponse.json();
            country = geoData.country_name || "Unknown";

            // Cache the results in sessionStorage
            try {
              sessionStorage.setItem("visitor_ip", ip);
              sessionStorage.setItem("visitor_country", country);
            } catch (storageError) {
              console.log("SessionStorage error:", storageError);
            }
          }
        }
      }
    } catch (geoError) {
      console.log("Error getting geolocation data:", geoError);
      // Hata durumunda varsayılan değerleri kullan
    }

    try {
      const response = await fetch("/api/track-visitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ip,
          userAgent,
          language,
          referrer,
          page,
          country,
        }),
      });

      if (!response.ok) {
        console.log("Response not OK in trackVisitor:", response.status);
        return { success: false };
      }

      return await response.json();
    } catch (fetchError) {
      console.log("Fetch error in trackVisitor:", fetchError);
      return { success: false, error: fetchError };
    }
  } catch (error) {
    // Hata durumunda sessizce başarılı dön
    console.error("Error tracking visitor:", error);
    return { success: false, error: error };
  }
}
