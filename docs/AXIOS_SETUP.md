# 📡 Configuración de Axios

## Instalación

Ya está instalado:
```bash
npm install axios
```

---

## 📁 Estructura de Configuración

### 1. **Instancia de Axios** → [src/lib/axios.ts](src/lib/axios.ts)

Archivo central que configura axios con:
- ✅ Base URL desde `environment.ts`
- ✅ Headers por defecto
- ✅ Timeout de 10s
- ✅ Interceptor de request (agrega token)
- ✅ Interceptor de response (maneja errores 401)

**Uso:**
```typescript
import { apiClient } from '@/lib/axios';

const response = await apiClient.get('/users');
```

---

### 2. **Servicio Base Genérico** → [src/lib/baseApiService.ts](src/lib/baseApiService.ts)

Clase base que proporciona métodos genéricos (GET, POST, PUT, PATCH, DELETE).

**Uso:**
```typescript
import { BaseApiService, ApiResponse } from '@/lib/baseApiService';

class UserService extends BaseApiService {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users');
  }
}
```

---

### 3. **Servicios Específicos**

#### Auth Service → [src/modules/auth/services/auth.service.ts](src/modules/auth/services/auth.service.ts)

```typescript
import { authService } from '@/modules/auth/services/auth.service';

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

if (result.ok) {
  console.log(result.data); // LoginResponse
} else {
  console.log(result.error); // Error message
}
```

---

## 🔧 Cómo Crear Nuevos Servicios

### Opción 1: Extender BaseApiService

```typescript
// src/modules/users/services/users.service.ts
import { BaseApiService, ApiResponse } from '@/lib/baseApiService';
import { User } from '../types/user.types';

class UserService extends BaseApiService {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/users/${id}`);
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.post<User>('/users', data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/users/${id}`);
  }
}

export const userService = new UserService();
```

### Opción 2: Usar directamente apiClient

```typescript
import { apiClient } from '@/lib/axios';

// GET
const { data } = await apiClient.get('/users');

// POST
const { data } = await apiClient.post('/users', { name: 'John' });

// PUT
const { data } = await apiClient.put('/users/1', { name: 'Jane' });

// DELETE
await apiClient.delete('/users/1');
```

---

## 🔐 Autenticación

### Token en Request
El interceptor automáticamente agrega el token en cada request:

```typescript
Authorization: Bearer <token>
```

### Token desde

El token se obtiene de:
1. localStorage (`access_token`)
2. Cookies (`access_token`)

### Error 401
Si el backend retorna 401 (no autorizado):
- Se borra el token
- Se redirige a `/auth/login`

---

## 📋 Interfaz de Respuesta

```typescript
interface ApiResponse<T = any> {
  ok: boolean;        // true si fue exitoso
  data?: T;           // Datos de respuesta
  error?: string;     // Mensaje de error
  statusCode?: number; // HTTP status code
}
```

**Ejemplo:**
```typescript
const result = await userService.getUsers();

// Éxito
if (result.ok) {
  const users = result.data; // User[]
  console.log(users);
}

// Error
else {
  console.error(result.error); // "Server error"
  console.error(result.statusCode); // 500
}
```

---

## 🚀 Ejemplo Completo: CRUD de Productos

### 1. Tipos
```typescript
// src/modules/products/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}
```

### 2. Servicio
```typescript
// src/modules/products/services/products.service.ts
import { BaseApiService } from '@/lib/baseApiService';
import { Product } from '../types/product.types';

class ProductService extends BaseApiService {
  async getProducts() {
    return this.get<Product[]>('/products');
  }

  async getProduct(id: string) {
    return this.get<Product>(`/products/${id}`);
  }

  async createProduct(data: Omit<Product, 'id'>) {
    return this.post<Product>('/products', data);
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.put<Product>(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.delete(`/products/${id}`);
  }
}

export const productService = new ProductService();
```

### 3. Hook para usar en componentes
```typescript
// src/modules/products/hooks/useProducts.ts
'use client';

import { useEffect, useState } from 'react';
import { productService } from '../services/products.service';
import { Product } from '../types/product.types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await productService.getProducts();
      
      if (result.ok) {
        setProducts(result.data || []);
      } else {
        setError(result.error || 'Error fetching products');
      }
      
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
```

### 4. Usar en un componente
```typescript
// src/app/products/page.tsx
'use client';

import { useProducts } from '@/modules/products/hooks/useProducts';

export default function ProductsPage() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(p => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>${p.price}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## ⚙️ Configuración Avanzada

### Cambiar Base URL
```typescript
// src/config/environment.ts
export const baseUrl = 'https://api.ejemplo.com/api';
```

### Agregar Headers Personalizados
```typescript
// En src/lib/axios.ts - agregar al create:
apiClient.defaults.headers.common['X-API-Key'] = 'your-key';
```

### Custom Interceptor
```typescript
apiClient.interceptors.request.use(
  (config) => {
    console.log('Request:', config.url);
    return config;
  }
);
```

---

## 📚 Comparación: Fetch vs Axios

| Fetch | Axios |
|-------|-------|
| Nativo de JS | Librería |
| Más verbose | Más conciso |
| Requiere JSON.stringify | Auto serializa |
| Requiere manual de headers | Headers por defecto |
| Error handling diferente | Manejo consistente |
| Sin interceptors | Con interceptors |

### Ejemplo comparativo

**Fetch:**
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
});

if (!response.ok) throw new Error('Error');
const data = await response.json();
```

**Axios:**
```typescript
const { data } = await apiClient.post('/users', { name: 'John' });
```

---

## 🎯 Resumen

✅ **Instancia global** en `src/lib/axios.ts`  
✅ **Servicio base** en `src/lib/baseApiService.ts`  
✅ **Servicios específicos** en cada módulo  
✅ **Autenticación automática** en cada request  
✅ **Error handling** centralizado  
✅ **Tipos TypeScript** para respuestas  

Ready to use! 🚀
