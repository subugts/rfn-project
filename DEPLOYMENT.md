# Morina Software - Deployment Guide

Bu dokümantasyon, Morina Software'ü farklı ortamlarda deployment etmek için adım adım talimatları sağlar.

## 📋 Ön Gereksinimler

### Yerel Geliştirme
- Node.js 18+
- npm veya yarn
- PostgreSQL 12+
- Redis 6+
- Git

### Docker ile
- Docker 20.10+
- Docker Compose 2.0+

### Production (Cloud)
- Vercel, Heroku, Railway, veya AWS
- PostgreSQL managed service
- Redis managed service

---

## 🏠 1. Yerel Geliştirme Ortamı

### 1.1 Temel Kurulum

```bash
# Proje klonla
git clone <repository-url>
cd rfn-project

# Bağımlılıkları yükle
npm install

# Ortam dosyasını kopyala
cp .env.example .env.local

# Ortam değişkenlerini düzenle
nano .env.local
```

### 1.2 Veritabanı Kurulumu

```bash
# PostgreSQL servisi başlat (macOS)
brew services start postgresql

# Veritabanını oluştur
createdb morina_db

# Prisma migration'larını çalıştır
npm run prisma:push

# (Opsiyonel) Demo verileri ekle
npm run prisma:seed

# Prisma Studio ile veri gözlemle
npm run prisma:studio
```

### 1.3 Redis Kurulumu

```bash
# Redis servisi başlat (macOS)
brew services start redis

# Redis'in çalıştığını kontrol et
redis-cli ping
# Çıktı: PONG
```

### 1.4 Geliştirme Sunucusu Başlat

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin.

**Demo Hesapları:**
- Admin: `admin@morina.com` / `Admin123!`
- Sevkiyatçı: `shipping@morina.com` / `Shipping123!`
- Muhasebe: `accounting@morina.com` / `Accounting123!`
- Operatör: `operator@morina.com` / `Operator123!`

---

## 🐳 2. Docker ile Deployment

### 2.1 Docker Compose ile Başlat

```bash
# .env dosyasını ayarla
cp .env.example .env

# Docker container'larını başlat
docker-compose up -d

# Logları izle
docker-compose logs -f app

# Servislerin durumunu kontrol et
docker-compose ps
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### 2.2 Veritabanı Migrate Etme

```bash
# Migration'ları çalıştır
docker-compose exec app npx prisma migrate deploy

# Demo verileri ekle
docker-compose exec app npm run prisma:seed
```

### 2.3 Container'ları Durdur

```bash
docker-compose down

# Verileri sil (temiz başlangıç)
docker-compose down -v
```

### 2.4 Custom Configuration

`docker-compose.yml` dosyasını düzenleyerek:
- Port numaralarını değiştir
- Environment değişkenlerini konfigüre et
- Ek servisler ekle (Iconia, MCsoft mock servers)

---

## ☁️ 3. Vercel'e Deployment

### 3.1 Proje Bağlantısı

```bash
# Vercel CLI'yi yükle
npm i -g vercel

# Vercel'e deploy et
vercel
```

### 3.2 Environment Variables Ayarı

Vercel Dashboard'da:
1. Project Settings > Environment Variables
2. Aşağıdaki değişkenleri ekle:

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-secret-key
ICONIA_API_URL=...
ICONIA_API_KEY=...
MCSOFT_API_URL=...
MCSOFT_API_KEY=...
```

### 3.3 Database Setup

Vercel üzerinde Postgres ya da externa bir Postgres provider kullan (örn. Neon, Supabase):

```bash
# Migration'ları çalıştır
vercel env pull

# .env.local'dan okuyarak production'a migrate et
npx prisma migrate deploy
```

---

## 🚂 4. Railway.app'e Deployment

### 4.1 Proje Setup

```bash
# Railway CLI'yi yükle
npm install -g @railway/cli

# Giriş yap
railway login

# Yeni proje oluştur
railway init
```

### 4.2 Servisler Ekle

Railway Dashboard'da:
1. New Service > PostgreSQL
2. New Service > Redis
3. New Service > GitHub Repo'dan deploy

### 4.3 Environment Variables

Railway'de başlatılan servisler otomatik olarak connection strings sağlar.

```bash
# Lokal olarak
railway env > .env.local

# Production'a migrate et
railway run npx prisma migrate deploy
```

---

## 🌩️ 5. AWS ECS ile Deployment

### 5.1 ECR Repository Oluştur

```bash
# AWS CLI ile repository oluştur
aws ecr create-repository --repository-name morina-app

# Docker image'ını build et ve push et
docker build -t morina-app .
docker tag morina-app:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/morina-app:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/morina-app:latest
```

### 5.2 RDS Database Oluştur

```bash
# AWS CLI ile PostgreSQL RDS instance oluştur
aws rds create-db-instance \
  --db-instance-identifier morina-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username morina_user \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxx
```

### 5.3 ElastiCache Redis

```bash
# Redis cluster oluştur
aws elasticache create-cache-cluster \
  --cache-cluster-id morina-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### 5.4 ECS Task Definition

`ecs-task-definition.json` oluştur:

```json
{
  "family": "morina-app",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "morina-app",
      "image": "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/morina-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://morina_user:PASSWORD@morina-db.REGION.rds.amazonaws.com:5432/morina_db"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://morina-redis.REGION.cache.amazonaws.com:6379"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/morina-app",
          "awslogs-region": "REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512"
}
```

### 5.5 ECS Service Oluştur

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

aws ecs create-service \
  --cluster morina-cluster \
  --service-name morina-service \
  --task-definition morina-app \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

## 🔒 6. Production Security

### 6.1 Environment Variables

```bash
# Production'da asla .env.local kullanma
# Tüm sensitif değerleri cloud provider'ın secret manager'ına koy
```

### 6.2 HTTPS & SSL

- Vercel/Railway otomatik SSL sağlar
- AWS: ACM Certificate Manager kullan
- Custom domain: DNS provider'ında CNAME kayıt ekle

### 6.3 Database Backup

```bash
# PostgreSQL backup
pg_dump morina_db > backup.sql

# AWS RDS: Automated backup'ları enable et
# Vercel: Veritabanı sağlayıcısı (Neon, Supabase) automatic backup'ları yönetir
```

### 6.4 Monitoring & Logging

- Vercel: Project Analytics & Monitoring
- Railway: Built-in monitoring
- AWS: CloudWatch
- External: Sentry for error tracking

```bash
# Sentry setup (optional)
npm install @sentry/nextjs
```

---

## 📊 7. Database Yönetimi

### 7.1 Migration'lar

```bash
# Yeni migration oluştur
npm run prisma:migrate

# Migration durumunu kontrol et
npx prisma migrate status

# Production'a deploy et
npx prisma migrate deploy
```

### 7.2 Backup & Restore

```bash
# PostgreSQL backup
pg_dump -h localhost -U morina_user morina_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -h localhost -U morina_user morina_db < backup.sql
```

---

## 🔄 8. CI/CD Pipeline Setup

### 8.1 GitHub Actions

`.github/workflows/deploy.yml` dosyası oluştur:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npx vercel --prod --token $VERCEL_TOKEN
```

---

## 🚨 9. Troubleshooting

### Problem: Database bağlantısı hatası

```bash
# Connection string'i kontrol et
echo $DATABASE_URL

# PostgreSQL'in çalıştığını kontrol et
pg_isready -h localhost -U morina_user
```

### Problem: Redis bağlantısı hatası

```bash
# Redis'in çalıştığını kontrol et
redis-cli ping

# Redis memory kullanımını kontrol et
redis-cli info memory
```

### Problem: Migration hatası

```bash
# Reset ve yeniden migrate et (DEV only)
npm run prisma:push

# Detaylı migration loglarını gör
npm run prisma:migrate -- --verbose
```

---

## 📞 Support

Deployment ile ilgili sorular için:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://railway.app/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Docker Docs](https://docs.docker.com/)
