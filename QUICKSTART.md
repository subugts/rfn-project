# Morina Software - Quick Start Guide

5 dakika içinde başlayın!

## 🚀 En Hızlı Başlangıç (Docker)

### 1. Proje klonla

```bash
cd rfn-project
```

### 2. .env dosyasını oluştur

```bash
cp .env.example .env
```

### 3. Docker'ı başlat

```bash
docker-compose up -d
```

### 4. Database'i initialize et

```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run prisma:seed
```

### 5. Tarayıcıyı aç

```
http://localhost:3000
```

**Demo hesabı:**
- Email: `admin@morina.com`
- Password: `Admin123!`

---

## 💻 Yerel Geliştirme

### 1. Gerekli yazılımlar yükle

```bash
# macOS
brew install node postgresql redis

# Linux (Ubuntu/Debian)
sudo apt-get install nodejs postgresql redis-server
```

### 2. Servisleri başlat

```bash
# PostgreSQL
brew services start postgresql

# Redis
brew services start redis
```

### 3. Database oluştur

```bash
createdb morina_db
```

### 4. Proje kurulumu

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını hazırla
cp .env.example .env.local

# Database'i setup et
npm run prisma:push

# Demo verilerini ekle (opsiyonel)
npm run prisma:seed
```

### 5. Dev sunucusu başlat

```bash
npm run dev
```

---

## 📋 Kullanıcı Rolleri

### Admin
- **Email:** admin@morina.com
- **Şifre:** Admin123!
- **Erişim:** Tüm sistem

### Sevkiyatçı
- **Email:** shipping@morina.com
- **Şifre:** Shipping123!
- **Erişim:** Siparişler, Teslimatlar, Takvim

### Muhasebe
- **Email:** accounting@morina.com
- **Şifre:** Accounting123!
- **Erişim:** Siparişler, Cariler, Sözleşmeler, Fiyatlandırma

### Operatör
- **Email:** operator@morina.com
- **Şifre:** Operator123!
- **Erişim:** Üretim, Siparişler, Yorumlar

---

## 🔍 Sistemin Yapısı

```
┌─────────────┐
│   Browser   │ (React + Tailwind)
└──────┬──────┘
       │
┌──────▼──────────────────┐
│   Next.js Application   │
│   - API Routes          │
│   - Pages               │
│   - Middleware          │
└──────┬──────────────────┘
       │
   ┌───┴────────────────┬─────────────┬────────────────┐
   │                    │             │                │
┌──▼──┐          ┌─────▼─┐      ┌────▼──────┐    ┌──▼─────┐
│ PG  │          │Redis  │      │Queue(Bull)│    │External│
│DB   │          │Queue  │      │System     │    │APIs    │
└─────┘          └───────┘      └───────────┘    └────────┘
```

---

## 🛠️ Yaygın Komutlar

### Development

```bash
# Dev sunucusu başlat
npm run dev

# Dosyaları lint'le
npm run lint

# Build et
npm run build

# Production'da çalıştır
npm run start
```

### Database

```bash
# Prisma Studio aç (GUI database manager)
npm run prisma:studio

# Migration oluştur
npm run prisma:migrate

# Database şemasını push et
npm run prisma:push

# Demo verilerini ekle
npm run prisma:seed
```

### Docker

```bash
# Container'ları başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f

# Container'ları durdur
docker-compose down

# Verileri sil (temiz başlangıç)
docker-compose down -v
```

---

## 🌐 Önemli URL'ler

- **Ana Sayfa:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard
- **API:** http://localhost:3000/api
- **Prisma Studio:** http://localhost:5555 (npm run prisma:studio)
- **pgAdmin:** http://localhost:5050 (Docker only)
- **Redis Commander:** http://localhost:8081 (Docker only)

---

## 🔐 İlk Çalıştırırken

1. **Admin hesabı ile giriş yap**
   - Email: admin@morina.com
   - Password: Admin123!

2. **Cariler oluştur** (Accounting → Cariler)
   - Müşteriler ekle
   - Birim fiyatlar set et

3. **Siparişler aç** (Accounting → Siparişler)
   - Sipariş miktarı ve tarihlerini belirt

4. **Üretim takip** (Operator → Üretim)
   - Siparişlerin durumunu izle

5. **Teslimat yönet** (Shipping → Teslimatlar)
   - Teslimat planları oluştur ve takip et

---

## ❓ Sıkça Sorulan Sorular

### Q: Port 3000 zaten kullanılıyor?

```bash
# Farklı port'ta başlat
npm run dev -- -p 3001
```

### Q: Database connection hatası?

```bash
# PostgreSQL servisi çalışıyor mu?
brew services list

# PostgreSQL'i başlat
brew services start postgresql

# Connection test et
psql -U postgres -d morina_db
```

### Q: Redis connection hatası?

```bash
# Redis servisi çalışıyor mu?
redis-cli ping

# Redis'i başlat
brew services start redis
```

### Q: Authentication hatası?

```bash
# .env.local dosyasını kontrol et
# JWT_SECRET ve NEXTAUTH_SECRET var mı?

# Token'ı sil ve tekrar login yap
# localStorage'dan token'ı temizle
```

### Q: Seed verilerini yeniden eklemek istiyorum?

```bash
# Tüm verileri sil ve yeniden seed et
npm run prisma:push -- --force-reset
npm run prisma:seed
```

---

## 📚 Daha Fazla Bilgi

- 📖 **README.md** - Kapsamlı dokümantasyon
- 🚀 **DEPLOYMENT.md** - Production deployment rehberi
- 📡 **API_DOCUMENTATION.md** - API endpoint'leri
- 🐳 **docker-compose.yml** - Docker yapılandırması

---

## 💡 İpuçları

1. **Responsive tasarım:** Tarayıcı dev tools'da responsive mode'u açın (F12)
2. **Database'i görselleştir:** `npm run prisma:studio` komutu ile GUI açın
3. **API test:** cURL veya Postman kullanarak API'ları test edin
4. **Logları takip et:** `docker-compose logs -f` ile live logları izleyin

---

## 🚨 Sorun Giderme

### "Database connection failed"
```bash
createdb morina_db
npm run prisma:push
```

### "Port already in use"
```bash
lsof -i :3000  # Hangi process'in kullandığını göster
kill -9 <PID>  # Process'i kapat
```

### "Module not found"
```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

---

**🎉 Hazır! Morina Software'ü kullanmaya başlayabilirsiniz!**

Sorular? README.md dosyasına bakın veya iletişime geçin.
