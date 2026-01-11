# Resend E-posta Entegrasyonu Kurulumu

## Adım 1: Resend Hesabı Oluştur
1. https://resend.com adresine gidin
2. Ücretsiz hesap oluşturun
3. E-posta adresinizi doğrulayın

## Adım 2: API Key Oluştur
1. Resend dashboard'a giriş yapın
2. "API Keys" bölümüne gidin
3. "Create API Key" butonuna tıklayın
4. İsim verin (örn: "Siparis Production")
5. API key'i kopyalayın (sadece bir kez gösterilir!)

## Adım 3: Environment Variable Ekleme

### Production (Vercel/Netlify vb.)
1. Hosting platformunuzun environment variables bölümüne gidin
2. Yeni bir variable ekleyin:
   - Key: `re_h7jLdXAG_3ymV1DfhP96i6f6iYJBC8c4W`
   - Value: (Resend'den aldığınız API key)

3. (Opsiyonel) Gönderen e-posta adresi:
   - Key: `RESEND_FROM_EMAIL`
   - Value: `Siparis <noreply@siparis-sistemi.com>`

### Local Development (.env.local)
`.env.local` dosyası oluşturun (eğer yoksa):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Siparis <noreply@siparis-sistemi.com>
```

## Adım 4: Domain Verification (Opsiyonel)

Kendi domain'inizle e-posta göndermek istiyorsanız:

1. Resend dashboard'da "Domains" bölümüne gidin
2. Domain ekleyin (örn: siparis-sistemi.com)
3. DNS kayıtlarını ekleyin (Resend tarafından verilir)
4. Verification tamamlanınca kullanabilirsiniz

**Not:** Domain verify etmezseniz, Resend'in default domain'i ile gönderim yapılır (onboarding@resend.dev). Bu da çalışır ama daha profesyonel görünmesi için kendi domain'inizi kullanmanız önerilir.

## Test Etme

1. Siteyi yeniden deploy edin (environment variable ekledikten sonra)
2. Kayıt ol sayfasına gidin
3. E-posta adresinizi girin
4. Doğrulama kodu e-postanıza gelmeli

## Sorun Giderme

### Mail gelmiyor
- ✅ Resend API key doğru mu kontrol edin
- ✅ Environment variable production'da ayarlandı mı?
- ✅ Spam klasörünü kontrol edin
- ✅ Resend dashboard'da "Logs" bölümünden mail gönderim durumunu kontrol edin

### API Key hatası
- ✅ API key'i doğru kopyaladınız mı?
- ✅ Environment variable adı tam olarak `RESEND_API_KEY` olmalı
- ✅ Production'da environment variable'ı ekledikten sonra siteyi yeniden deploy ettiniz mi?

## Limitler (Ücretsiz Plan)
- Aylık 3,000 e-posta
- Günlük 100 e-posta
- API rate limit: 10 req/sn

Daha fazla bilgi: https://resend.com/docs
