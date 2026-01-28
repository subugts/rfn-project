# Morina Software - API Documentation

REST API ve entegrasyon dokümantasyonu.

## 📌 Base URL

```
Development: http://localhost:3000
Production: https://morina.example.com
```

## 🔐 Authentication

Tüm endpoint'ler JWT token ile authenticate edilmelidir.

### Login

**POST** `/api/auth/login`

```json
{
  "email": "admin@morina.com",
  "password": "Admin123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "admin@morina.com",
    "name": "Sistem Yöneticisi",
    "role": "ADMIN"
  }
}
```

### Logout

**POST** `/api/auth/logout`

**Response (200):**
```json
{
  "success": true
}
```

### Register

**POST** `/api/auth/register`

```json
{
  "email": "newuser@morina.com",
  "password": "SecurePass123!",
  "name": "Kullanıcı Adı",
  "role": "SHIPPING"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-456",
    "email": "newuser@morina.com",
    "name": "Kullanıcı Adı",
    "role": "SHIPPING"
  }
}
```

## 📦 Orders (Siparişler)

### List Orders

**GET** `/api/orders`

**Query Parameters:**
- `status` - Order status (DRAFT, OPEN, PRODUCTION, SHIPPED, COMPLETED, CANCELLED)
- `customerId` - Filter by customer

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "order-123",
    "orderNumber": "ORD-1704067200000",
    "customerId": "cust-456",
    "customer": {
      "id": "cust-456",
      "code": "CUST001",
      "name": "ABC İnşaat A.Ş."
    },
    "m3Amount": 50,
    "unitPrice": 150,
    "totalPrice": 7500,
    "status": "PRODUCTION",
    "orderDate": "2026-01-29T10:00:00Z",
    "deliveryDate": "2026-02-05T00:00:00Z",
    "contractId": "contract-123",
    "createdBy": "user-123",
    "notes": "Acil teslimat",
    "createdAt": "2026-01-29T10:00:00Z",
    "updatedAt": "2026-01-29T10:00:00Z"
  }
]
```

### Create Order

**POST** `/api/orders`

**Body:**
```json
{
  "customerId": "cust-456",
  "m3Amount": 50,
  "unitPrice": 150,
  "deliveryDate": "2026-02-05T00:00:00Z",
  "contractId": "contract-123",
  "notes": "Acil teslimat"
}
```

**Required Roles:** `ACCOUNTING`, `ADMIN`

**Response (201):**
```json
{
  "id": "order-123",
  "orderNumber": "ORD-1704067200000",
  "customerId": "cust-456",
  "m3Amount": 50,
  "unitPrice": 150,
  "totalPrice": 7500,
  "status": "OPEN",
  "createdAt": "2026-01-29T10:00:00Z"
}
```

### Get Order Details

**GET** `/api/orders/:orderId`

**Response (200):**
```json
{
  "id": "order-123",
  "orderNumber": "ORD-1704067200000",
  "customer": { ... },
  "m3Amount": 50,
  "status": "PRODUCTION",
  "contract": { ... },
  "productionPlan": {
    "id": "plan-123",
    "m3Planned": 50,
    "m3Completed": 30,
    "status": "IN_PROGRESS"
  },
  "deliveries": [ ... ],
  "comments": [ ... ]
}
```

### Update Order Status

**PATCH** `/api/orders/:orderId`

**Body:**
```json
{
  "status": "SHIPPED",
  "notes": "Updated notes"
}
```

**Required Roles:** `ACCOUNTING`, `SHIPPING`, `ADMIN`

**Response (200):** Updated order object

## 👥 Customers (Cariler)

### List Customers

**GET** `/api/customers`

**Query Parameters:**
- `active` - Filter by status (true/false)

**Response (200):**
```json
[
  {
    "id": "cust-456",
    "code": "CUST001",
    "name": "ABC İnşaat A.Ş.",
    "defaultUnitPrice": 150,
    "m3Limit": 1000,
    "currentM3Used": 350,
    "active": true,
    "notes": "Önemli müşteri",
    "priceRanges": [
      {
        "m3From": 0,
        "m3To": 100,
        "unitPrice": 150
      },
      {
        "m3From": 101,
        "m3To": 500,
        "unitPrice": 145
      }
    ],
    "contracts": [ ... ]
  }
]
```

### Create Customer

**POST** `/api/customers`

**Body:**
```json
{
  "code": "CUST003",
  "name": "Yeni Müşteri Ltd.",
  "defaultUnitPrice": 155,
  "m3Limit": 800,
  "notes": "Kano müşteri"
}
```

**Required Roles:** `ACCOUNTING`, `ADMIN`

**Response (201):** Created customer object

### Update Customer

**PUT** `/api/customers/:customerId`

**Body:**
```json
{
  "name": "Updated Name",
  "defaultUnitPrice": 160,
  "m3Limit": 1200,
  "active": true
}
```

**Required Roles:** `ACCOUNTING`, `ADMIN`

**Response (200):** Updated customer object

### Update Customer M3 Pricing

**POST** `/api/customers/:customerId/price-ranges`

**Body:**
```json
{
  "m3From": 0,
  "m3To": 100,
  "unitPrice": 150
}
```

**Response (201):** Created price range object

## 📋 Contracts (Sözleşmeler)

### List Contracts

**GET** `/api/contracts`

**Query Parameters:**
- `active` - Filter by status
- `customerId` - Filter by customer

**Response (200):**
```json
[
  {
    "id": "contract-123",
    "contractNumber": "CNT-2026-001",
    "customerId": "cust-456",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T00:00:00Z",
    "m3Limit": 1000,
    "unitPrice": 145,
    "active": true,
    "notes": "Annual contract",
    "updates": [ ... ]
  }
]
```

### Create Contract

**POST** `/api/contracts`

**Body:**
```json
{
  "customerId": "cust-456",
  "contractNumber": "CNT-2026-001",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-12-31T00:00:00Z",
  "m3Limit": 1000,
  "unitPrice": 145
}
```

**Required Roles:** `ACCOUNTING`, `ADMIN`

**Response (201):** Created contract object

## 🚚 Deliveries (Teslimatlar)

### List Deliveries

**GET** `/api/deliveries`

**Query Parameters:**
- `status` - SCHEDULED, IN_PROGRESS, COMPLETED, FAILED
- `orderId` - Filter by order

**Response (200):**
```json
[
  {
    "id": "delivery-123",
    "deliveryId": "DEL-2026-001",
    "orderId": "order-123",
    "order": { ... },
    "scheduleId": "schedule-456",
    "status": "IN_PROGRESS",
    "driverId": "driver-001",
    "vehicleId": "vehicle-001",
    "m3Delivered": 25,
    "actualDeliveryDate": "2026-02-05T14:30:00Z",
    "trackingEvents": [ ... ]
  }
]
```

### Create Delivery

**POST** `/api/deliveries`

**Body:**
```json
{
  "orderId": "order-123",
  "scheduleId": "schedule-456",
  "driverId": "driver-001",
  "vehicleId": "vehicle-001",
  "m3Delivered": 25
}
```

**Required Roles:** `SHIPPING`, `ADMIN`

**Response (201):** Created delivery object

### Update Delivery Status

**PATCH** `/api/deliveries/:deliveryId`

**Body:**
```json
{
  "status": "COMPLETED",
  "actualDeliveryDate": "2026-02-05T14:30:00Z"
}
```

**Response (200):** Updated delivery object

## 💬 Comments (Yorumlar)

### Add Comment to Order

**POST** `/api/orders/:orderId/comments`

**Body:**
```json
{
  "content": "Production should start tomorrow morning",
  "commentType": "NOTE"
}
```

**Comment Types:** `NOTE`, `SUGGESTION`, `WARNING`, `INFO`

**Required Roles:** All authenticated users

**Response (201):**
```json
{
  "id": "comment-123",
  "orderId": "order-123",
  "userId": "user-123",
  "user": {
    "name": "Operatör Adı"
  },
  "content": "Production should start tomorrow morning",
  "commentType": "NOTE",
  "createdAt": "2026-01-29T10:00:00Z"
}
```

## 🔄 Queue System (İleti Sistemi)

### List Queue Messages

**GET** `/api/queue/messages`

**Query Parameters:**
- `status` - PENDING, PROCESSING, SUCCESS, FAILED, DEAD_LETTER
- `type` - SEND_TO_ICONIA, SEND_TO_MCSOFT, etc.

**Required Roles:** `ADMIN`

**Response (200):**
```json
[
  {
    "id": "msg-123",
    "type": "SEND_TO_MCSOFT",
    "status": "SUCCESS",
    "attempts": 1,
    "relatedOrderId": "order-123",
    "createdAt": "2026-01-29T10:00:00Z",
    "processedAt": "2026-01-29T10:00:05Z"
  }
]
```

### Retry Failed Message

**POST** `/api/queue/messages/:messageId/retry`

**Required Roles:** `ADMIN`

**Response (200):**
```json
{
  "success": true,
  "message": "Message queued for retry"
}
```

## 📊 Production Plans (Üretim Planları)

### Get Production Plan

**GET** `/api/orders/:orderId/production-plan`

**Response (200):**
```json
{
  "id": "plan-123",
  "orderId": "order-123",
  "m3Planned": 50,
  "m3Completed": 30,
  "startDate": "2026-01-29T09:00:00Z",
  "completionDate": null,
  "status": "IN_PROGRESS",
  "notes": "Production started at 9 AM"
}
```

### Update Production Plan

**PATCH** `/api/orders/:orderId/production-plan`

**Body:**
```json
{
  "m3Completed": 35,
  "status": "COMPLETED",
  "completionDate": "2026-02-04T17:00:00Z",
  "notes": "Finished early"
}
```

**Required Roles:** `OPERATOR`, `ADMIN`

**Response (200):** Updated production plan

## ⚠️ Error Responses

### 400 - Bad Request

```json
{
  "error": "Invalid input",
  "details": [
    {
      "code": "too_small",
      "minimum": 6,
      "type": "string",
      "path": ["password"],
      "message": "String must contain at least 6 character(s)"
    }
  ]
}
```

### 401 - Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 - Forbidden

```json
{
  "error": "Insufficient permissions"
}
```

### 404 - Not Found

```json
{
  "error": "Resource not found"
}
```

### 409 - Conflict

```json
{
  "error": "Customer with this code already exists"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## 🔗 Integration Endpoints

### Iconia Sync

**POST** `/api/integrations/iconia/sync`

**Body:**
```json
{
  "deliveryId": "delivery-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "iconiaDocId": "ICON-2026-001"
}
```

### MCsoft Sync

**POST** `/api/integrations/mcsoft/sync`

**Body:**
```json
{
  "orderId": "order-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "mcSoftJobId": "JOB-2026-001"
}
```

---

## 📚 Rate Limiting

API rate limiting kurallı:
- 100 requests per minute (authenticated)
- 20 requests per minute (unauthenticated)

## 🔄 Pagination

Liste endpoint'lerinde:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (default: createdAt)
- `order` - asc or desc

**Response:**
```json
{
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

## 🧪 Testing API

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin123!"}'

# Get Orders
TOKEN="your-token-here"
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN"

# Create Order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-456",
    "m3Amount": 50,
    "unitPrice": 150
  }'
```

### Postman Collection

`postman_collection.json` dosyasını import et (yakında eklenecek)

---

**API Version:** 1.0
**Last Updated:** 29 Ocak 2026
