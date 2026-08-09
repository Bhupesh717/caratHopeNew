# 🎯 Attribute Master — Frontend Specification Document

> Frontend team ke liye complete guide — kya kya pages banenge, kaunse APIs call honge, fields kya hongi, validations kya lagenge, flow kya hoga.

---

## 📌 Module Overview

Attribute system product variations define karta hai (jaise Color, Size, Carat, Clarity). Isme **3 sub-modules** hain:

| # | Module | Purpose |
|---|--------|---------|
| 1 | **Attribute Master** | Attributes create/edit/delete karna (e.g., Color, Size) |
| 2 | **Attribute Values** | Har attribute ki possible values manage karna (e.g., Red, Blue, Green) |
| 3 | **Category-Attribute Mapping** | Kaunse attribute kaunsi category se linked hai (e.g., Rings → Size, Carat) |

---

## 🔐 Authentication

Saare API calls me **Bearer Token** header lagega:
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

Base URL: `/api/admin`

---

## 📄 Module 1: Attribute Master (CRUD)

### 1.1 — Attribute Listing Page

**Page:** `Attribute List`  
**API:** `GET /api/admin/attributes`  
**Auth:** Required (Bearer Token)

#### API Response Format:
```json
{
  "status": true,
  "message": "Attributes retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Color",
      "slug": "color",
      "input_type": "select",
      "unit": null,
      "affects_price": true,
      "created_at": "2026-07-07T10:00:00Z",
      "updated_at": "2026-07-07T10:00:00Z",
      "values": [
        {
          "id": 1,
          "attribute_id": 1,
          "value": "Red",
          "price_modifier": "100.00",
          "sort_order": 1
        },
        {
          "id": 2,
          "attribute_id": 1,
          "value": "Blue",
          "price_modifier": "0.00",
          "sort_order": 2
        }
      ]
    }
  ]
}
```

#### Table Columns to Show:

| Column | Field | Notes |
|--------|-------|-------|
| Sr No. | — | Auto increment |
| Name | `name` | Text |
| Slug | `slug` | Text (grey/muted) |
| Input Type | `input_type` | Badge/Tag — `select` / `number` / `text` |
| Unit | `unit` | Show "-" agar null hai |
| Affects Price | `affects_price` | Yes/No badge ya toggle |
| Values Count | `values.length` | Number count |
| Actions | — | Edit, Delete, Manage Values buttons |

#### Features:
- ✅ Search/filter by name
- ✅ "+ Add Attribute" button (opens add form/modal)
- ✅ Each row me 3 action buttons: **Edit** ✏️ | **Delete** 🗑️ | **Manage Values** 📋

---

### 1.2 — Add New Attribute

**Action:** "+ Add Attribute" button click pe modal/form open hoga  
**API:** `POST /api/admin/attributes`  
**Method:** POST

#### Form Fields:

| Field | Key | Type | Required | Validation | Notes |
|-------|-----|------|----------|------------|-------|
| Name | `name` | Text Input | ✅ Yes | Max 255 chars | e.g., "Color", "Size", "Carat" |
| Slug | `slug` | Text Input | ✅ Yes | Max 255 chars, unique | Auto-generate from name (lowercase, hyphenated). User can manually edit bhi. |
| Input Type | `input_type` | Dropdown/Select | ✅ Yes | Only: `select`, `number`, `text` | — |
| Unit | `unit` | Text Input | ❌ No | Max 50 chars | e.g., "mm", "ct", "gm", "inch" |
| Affects Price | `affects_price` | Toggle/Checkbox | ❌ No | Boolean | Default: `false` |

#### Request Body:
```json
{
  "name": "Color",
  "slug": "color",
  "input_type": "select",
  "unit": null,
  "affects_price": true
}
```

#### Success Response (201):
```json
{
  "status": true,
  "message": "Attribute created successfully",
  "data": {
    "id": 1,
    "name": "Color",
    "slug": "color",
    "input_type": "select",
    "unit": null,
    "affects_price": true,
    "created_at": "...",
    "updated_at": "...",
    "values": []
  }
}
```

#### Validation Error Response (422):
```json
{
  "message": "The slug has already been taken.",
  "errors": {
    "slug": ["The slug has already been taken."]
  }
}
```

#### Slug Auto-Generate Logic:
```
"Diamond Color" → "diamond-color"
"Carat Weight" → "carat-weight"
```
- Lowercase
- Space → hyphen
- Special characters remove
- User manually change bhi kar sake

---

### 1.3 — Edit Attribute

**Action:** Row me Edit ✏️ button click pe  
**API (fetch existing):** `GET /api/admin/attributes/{id}`  
**API (update):** `PUT /api/admin/attributes/{id}`

#### Same form fields as Add, pre-filled with existing data.

#### Request Body:
```json
{
  "name": "Color Updated",
  "slug": "color-updated",
  "input_type": "select",
  "unit": null,
  "affects_price": false
}
```

#### Success Response (200):
```json
{
  "status": true,
  "message": "Attribute updated successfully",
  "data": { ... }
}
```

---

### 1.4 — Delete Attribute

**Action:** Row me Delete 🗑️ button click pe  
**API:** `DELETE /api/admin/attributes/{id}`

> [!WARNING]
> Delete se pehle **confirmation dialog** dikhana — "Are you sure? This will also delete all attribute values."

#### Success Response (200):
```json
{
  "status": true,
  "message": "Attribute deleted successfully",
  "data": null
}
```

---

## 📄 Module 2: Attribute Values Management

### 2.1 — Manage Values (Drawer/Modal/Page)

**Action:** Attribute list me "Manage Values" 📋 button click pe open hoga  
**Parent Info:** Jis attribute ka values manage kar rahe hain uska `name` header me show hona chahiye (e.g., "Manage Values — Color")

#### Existing Values List

Values `GET /api/admin/attributes` ki response me already aati hain (`values` array inside each attribute). Alag API call ki zaroorat nahi. Agar chahein toh single attribute fetch karein:

**API:** `GET /api/admin/attributes/{id}`

#### Values Table Columns:

| Column | Field | Notes |
|--------|-------|-------|
| Sr No. | — | Auto increment |
| Value | `value` | Text — e.g., "Red", "18mm" |
| Price Modifier (₹) | `price_modifier` | Decimal — e.g., "500.00" |
| Sort Order | `sort_order` | Integer — display order |
| Action | — | Delete 🗑️ button |

---

### 2.2 — Add New Value

**API:** `POST /api/admin/attributes/{attributeId}/values`

#### Form Fields:

| Field | Key | Type | Required | Validation | Notes |
|-------|-----|------|----------|------------|-------|
| Value | `value` | Text Input | ✅ Yes | Max 255 chars | e.g., "Red", "22ct", "18mm" |
| Price Modifier | `price_modifier` | Number Input | ❌ No | Numeric | Default: 0.00. Extra price add hogi variant me |
| Sort Order | `sort_order` | Number Input | ❌ No | Integer | Default: 0. Display ordering ke liye |

#### Request Body:
```json
{
  "value": "Red",
  "price_modifier": 500.00,
  "sort_order": 1
}
```

#### Success Response (201):
```json
{
  "status": true,
  "message": "Attribute value created successfully",
  "data": {
    "id": 5,
    "attribute_id": 1,
    "value": "Red",
    "price_modifier": "500.00",
    "sort_order": 1,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

> [!TIP]
> Add hone ke baad list refresh karein taaki naya value immediately table me dikhe.

---

### 2.3 — Delete Value

**API:** `DELETE /api/admin/attributes/values/{valueId}`

> Confirm dialog dikhana before delete.

#### Success Response (200):
```json
{
  "status": true,
  "message": "Attribute value deleted successfully",
  "data": null
}
```

---

## 📄 Module 3: Category-Attribute Mapping

### 3.1 — Mapping Listing Page

**Page:** `Category Attribute Mapping`  
**API:** Listing ka dedicated endpoint nahi hai controller me, lekin internal `index` method se aata hai  

**API:** Internal listing use for reference — frontend pe mapping form ke neeche existing mappings ki table bana sakte hain using category-wise attribute fetch:

**API:** `GET /api/categories/{categoryId}/attributes` (Public route — no auth needed)

Ya poore mappings dekhne ke liye controller ka index use karein (agar route add karein).

#### Existing Mappings Table Columns:

| Column | Field | Notes |
|--------|-------|-------|
| Sr No. | — | Auto |
| Category | `category_name` | From join |
| Attribute | `attribute_name` | From join |
| Required | `is_required` | Yes/No badge |
| Action | — | Remove ❌ button |

---

### 3.2 — Create New Mapping

**API:** `POST /api/admin/category-attributes`  
**Auth:** Required

#### Form Fields:

| Field | Key | Type | Required | Validation | Notes |
|-------|-----|------|----------|------------|-------|
| Category | `category_id` | Dropdown | ✅ Yes | Must exist in categories table | Categories list `GET /api/admin/categories` se load karein |
| Attribute | `attribute_id` | Dropdown | ✅ Yes | Must exist in attributes table | Attributes list `GET /api/admin/attributes` se load karein |
| Is Required | `is_required` | Toggle/Checkbox | ❌ No | Boolean | Default: `true`. Kya is category ke products me ye attribute mandatory hai? |

#### Request Body:
```json
{
  "category_id": 3,
  "attribute_id": 1,
  "is_required": true
}
```

#### Success Response (201):
```json
{
  "status": true,
  "message": "Attribute associated with category successfully",
  "data": {
    "id": 7,
    "category_id": 3,
    "attribute_id": 1,
    "is_required": 1,
    "created_at": "..."
  }
}
```

#### Validation Error (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "category_id": ["The selected category id is invalid."],
    "attribute_id": ["The selected attribute id is invalid."]
  }
}
```

> [!NOTE]
> Same category + attribute combination agar already exist karti hai toh backend silently upsert kar deta hai (overwrite nahi karega, sync use hota hai).

---

### 3.3 — Remove Mapping

**API:** `DELETE /api/admin/category-attributes/{id}`  
**Auth:** Required

#### Success Response (200):
```json
{
  "status": true,
  "message": "Category attribute association removed successfully",
  "data": null
}
```

#### Not Found (404):
```json
{
  "status": false,
  "message": "Mapping not found",
  "data": null
}
```

---

## 📊 Complete API Endpoints Summary

| # | Method | Endpoint | Purpose | Auth |
|---|--------|----------|---------|------|
| 1 | `GET` | `/api/admin/attributes` | List all attributes (with values) | ✅ |
| 2 | `POST` | `/api/admin/attributes` | Create new attribute | ✅ |
| 3 | `GET` | `/api/admin/attributes/{id}` | Get single attribute (with values) | ✅ |
| 4 | `PUT` | `/api/admin/attributes/{id}` | Update attribute | ✅ |
| 5 | `DELETE` | `/api/admin/attributes/{id}` | Delete attribute (cascade deletes values) | ✅ |
| 6 | `POST` | `/api/admin/attributes/{id}/values` | Add value to an attribute | ✅ |
| 7 | `DELETE` | `/api/admin/attributes/values/{valueId}` | Delete a specific value | ✅ |
| 8 | `POST` | `/api/admin/category-attributes` | Map attribute to category | ✅ |
| 9 | `DELETE` | `/api/admin/category-attributes/{id}` | Remove mapping | ✅ |
| 10 | `GET` | `/api/categories/{categoryId}/attributes` | Get attributes for a category | ❌ Public |

---

## 🗄️ Database Schema Reference

### `attributes` Table
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint (PK) | No | Auto | — |
| name | varchar(255) | No | — | e.g., "Color" |
| slug | varchar(255) | No | — | Unique. e.g., "color" |
| input_type | enum | No | — | `select` / `number` / `text` |
| unit | varchar(50) | Yes | null | e.g., "mm", "ct" |
| affects_price | boolean | No | false | Price impact flag |
| created_at | timestamp | Yes | — | — |
| updated_at | timestamp | Yes | — | — |

### `attribute_values` Table
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint (PK) | No | Auto | — |
| attribute_id | bigint (FK) | No | — | → attributes.id (cascade delete) |
| value | varchar(255) | No | — | e.g., "Red", "22ct" |
| price_modifier | decimal(10,2) | No | 0.00 | Extra price for this value |
| sort_order | integer | No | 0 | Display ordering |
| created_at | timestamp | Yes | — | — |
| updated_at | timestamp | Yes | — | — |

### `category_attributes` Table (Pivot)
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint (PK) | No | Auto | — |
| category_id | bigint (FK) | No | — | → categories.id (cascade delete) |
| attribute_id | bigint (FK) | No | — | → attributes.id (cascade delete) |
| is_required | boolean | No | true | Mandatory for products? |
| created_at | timestamp | Yes | — | — |
| updated_at | timestamp | Yes | — | — |

> **Unique Constraint:** `(category_id, attribute_id)` — ek category me same attribute dobara nahi ja sakta.

---

## 🔄 Frontend Flow Diagram

```
Admin Panel Sidebar
    │
    ├── "Attribute Master" (click)
    │       │
    │       ├── [Attribute List Page] ← GET /api/admin/attributes
    │       │       │
    │       │       ├── [+ Add Attribute] → Modal/Form → POST /api/admin/attributes
    │       │       │
    │       │       ├── [Edit ✏️] → Modal/Form (pre-filled) → PUT /api/admin/attributes/{id}
    │       │       │
    │       │       ├── [Delete 🗑️] → Confirm → DELETE /api/admin/attributes/{id}
    │       │       │
    │       │       └── [Manage Values 📋] → Opens Values Panel
    │       │               │
    │       │               ├── [Values Table] (existing values shown)
    │       │               ├── [Add Value Form] → POST /api/admin/attributes/{id}/values
    │       │               └── [Delete Value ❌] → DELETE /api/admin/attributes/values/{valueId}
    │       │
    ├── "Category-Attribute Mapping" (click)
    │       │
    │       ├── [Mapping Form] — Category dropdown + Attribute dropdown + Required toggle
    │       │       └── Submit → POST /api/admin/category-attributes
    │       │
    │       └── [Existing Mappings Table]
    │               └── [Remove ❌] → DELETE /api/admin/category-attributes/{id}
```

---

## ✅ Frontend Team Checklist

- [ ] Attribute List page with search & table
- [ ] Add Attribute modal/form with slug auto-generation
- [ ] Edit Attribute modal/form (pre-filled)
- [ ] Delete Attribute with confirmation
- [ ] Manage Values panel (drawer/modal/separate page)
- [ ] Add new value inline form
- [ ] Delete value with confirmation
- [ ] Category-Attribute mapping page
- [ ] Mapping form with category & attribute dropdowns
- [ ] Remove mapping with confirmation
- [ ] Proper error handling (422 validation, 404 not found)
- [ ] Toast/snackbar notifications for success/error
- [ ] Loading states while API calls
