/**
 * Cha-ching (kasa) sesi - tüm sipariş/satış bildirimlerinde kullanılır
 */
export function playChaChing(): void {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio('/cha-ching.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {
    // Sessizce geç
  }
}
