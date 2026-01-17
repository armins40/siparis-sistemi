# Vercel Deploy Rehberi

## 🚀 Hızlı Deploy (npx ile)

Değişiklikleri Vercel'e deploy etmek için:

```bash
npx vercel
```

veya production'a deploy etmek için:

```bash
npx vercel --prod
```

## 📝 Adımlar

1. **İlk Deploy:**
   ```bash
   npx vercel
   ```
   - Vercel hesabınıza login olun (browser'da açılacak)
   - Proje zaten var ise seçin, yoksa yeni proje oluşturun
   - Ayarları onaylayın

2. **Production Deploy:**
   ```bash
   npx vercel --prod
   ```
   - Production ortamına deploy eder
   - `siparis-sistemi.vercel.app` domain'inde yayınlanır

## ⚙️ Environment Variables

Deploy'dan önce Vercel Dashboard'da environment variables'ların ekli olduğundan emin olun:
- `POSTGRES_URL` (Neon'dan kopyaladığınız connection string)

## 🔄 Sonraki Deploy'lar

Kod değişikliklerinden sonra tekrar deploy etmek için:
```bash
npx vercel --prod
```

## 🌐 Alternatif: GitHub Entegrasyonu

Eğer GitHub kullanıyorsanız:
1. GitHub'da repository oluşturun
2. Git remote ekleyin:
   ```bash
   git remote add origin https://github.com/kullaniciadi/repo-adi.git
   git push -u origin main
   ```
3. Vercel Dashboard'dan GitHub'ı bağlayın
4. Her push'ta otomatik deploy olur
