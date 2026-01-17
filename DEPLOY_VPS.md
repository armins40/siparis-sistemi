# VPS'e Deploy Rehberi

## Gereksinimler
- VPS (Hetzner, DigitalOcean, vb.)
- Domain adresi
- SSH erişimi

## 1. VPS Kurulumu

### Ubuntu 22.04 LTS Kurulumu
```bash
# Sunucuya SSH ile bağlan
ssh root@your-server-ip

# Sistem güncellemesi
apt update && apt upgrade -y

# Node.js 20.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL kurulumu
apt install -y postgresql postgresql-contrib

# Nginx kurulumu
apt install -y nginx

# PM2 kurulumu (process manager)
npm install -g pm2

# Git kurulumu
apt install -y git
```

## 2. PostgreSQL Kurulumu

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Database oluştur
CREATE DATABASE siparis_db;
CREATE USER siparis_user WITH PASSWORD 'güçlü_şifre_buraya';
GRANT ALL PRIVILEGES ON DATABASE siparis_db TO siparis_user;
\q

# Schema'yı yükle
psql -U siparis_user -d siparis_db -f /path/to/lib/db/schema.sql
```

## 3. Proje Kurulumu

```bash
# Proje klasörü oluştur
mkdir -p /var/www/siparis
cd /var/www/siparis

# Git'ten clone (veya dosya yükle)
git clone https://github.com/your-repo/siparis.git .

# Dependencies kur
npm install

# Environment variables oluştur
nano .env.local
```

### .env.local İçeriği:
```env
# Database
POSTGRES_URL=postgresql://siparis_user:güçlü_şifre_buraya@localhost:5432/siparis_db
POSTGRES_PRISMA_URL=postgresql://siparis_user:güçlü_şifre_buraya@localhost:5432/siparis_db
POSTGRES_URL_NON_POOLING=postgresql://siparis_user:güçlü_şifre_buraya@localhost:5432/siparis_db

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@siparis-sistemi.com

# Next.js
NODE_ENV=production
```

## 4. Build ve Deploy

```bash
# Build
npm run build

# PM2 ile çalıştır
pm2 start npm --name "siparis" -- start
pm2 save
pm2 startup
```

## 5. Nginx Yapılandırması

```bash
# Nginx config oluştur
nano /etc/nginx/sites-available/siparis
```

### Nginx Config:
```nginx
server {
    listen 80;
    server_name siparis-sistemi.com www.siparis-sistemi.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Config'i aktif et
ln -s /etc/nginx/sites-available/siparis /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 6. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
certbot --nginx -d siparis-sistemi.com -d www.siparis-sistemi.com

# Otomatik yenileme
certbot renew --dry-run
```

## 7. Firewall Yapılandırması

```bash
# UFW kurulumu
apt install -y ufw

# Portları aç
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## 8. Monitoring

```bash
# PM2 monitoring
pm2 monit

# Logları görüntüle
pm2 logs siparis

# Sistem kaynaklarını kontrol et
htop
```

## 9. Backup

```bash
# PostgreSQL backup script
nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"
mkdir -p $BACKUP_DIR
pg_dump -U siparis_user siparis_db > $BACKUP_DIR/siparis_db_$DATE.sql
# Eski backup'ları sil (7 günden eski)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x /usr/local/bin/backup-db.sh

# Cron job ekle (günlük backup)
crontab -e
# Şunu ekle:
0 2 * * * /usr/local/bin/backup-db.sh
```

## 10. Güncelleme

```bash
# Projeyi güncelle
cd /var/www/siparis
git pull
npm install
npm run build
pm2 restart siparis
```

## Sorun Giderme

### Port 3000 kullanımda
```bash
lsof -i :3000
kill -9 PID
```

### PM2 çalışmıyor
```bash
pm2 logs
pm2 restart siparis
```

### Database bağlantı hatası
```bash
# PostgreSQL servisini kontrol et
systemctl status postgresql
systemctl restart postgresql
```

## Performans Optimizasyonu

### Nginx Cache
```nginx
# Nginx config'e ekle
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

### PM2 Cluster Mode
```bash
pm2 delete siparis
pm2 start npm --name "siparis" -i max -- start
```

## Güvenlik

1. **Firewall:** Sadece gerekli portları aç
2. **SSH:** Key-based authentication kullan
3. **Database:** Güçlü şifre kullan
4. **Updates:** Düzenli güncelleme yap
5. **Backup:** Günlük backup al

## Maliyet Özeti

- **VPS (Hetzner):** €5.83/ay
- **Domain:** ~$10-15/yıl
- **Cloudinary:** Ücretsiz (free plan)
- **Resend:** Ücretsiz (100 email/gün)
- **Toplam:** ~€6/ay (~$7/ay)

## Destek

Sorun olursa:
1. PM2 logs kontrol et
2. Nginx error logs kontrol et
3. PostgreSQL logs kontrol et
4. Sistem kaynaklarını kontrol et (htop)
