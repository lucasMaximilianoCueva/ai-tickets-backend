# AI Tickets Backend

Backend API para gestión de tickets de soporte con análisis automático de prioridad mediante Inteligencia Artificial (Gemini).

## 🚀 Características

- **Análisis de Prioridad con IA**: Cada ticket es analizado automáticamente por Gemini AI para determinar su nivel de urgencia (BAJA, MEDIA, ALTA, CRITICA)
- **API RESTful**: Endpoints bien estructurados siguiendo mejores prácticas
- **Documentación Swagger**: Documentación interactiva OpenAPI 3.0
- **TypeScript**: Código type-safe con validaciones estrictas
- **Arquitectura Limpia**: Separación de responsabilidades (Controller → Service → Repository)
- **Almacenamiento en Memoria**: Persistencia durante la ejecución del servidor
- **SOLID Principles**: Código mantenible y escalable

## 📋 Requisitos Previos

- **Node.js**: v18 o superior
- **npm**: v9 o superior
- **API Key de Gemini**: Obtener desde [Google AI Studio](https://ai.google.dev/gemini-api/docs?hl=es-419)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd AiTickets
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar el archivo `.env` y agregar tu API Key de Gemini:

```env
GEMINI_API_KEY=tu_api_key_aqui
PORT=3000
NODE_ENV=development
```

> **Importante**: Obtén tu API Key gratuita desde [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🏃‍♂️ Ejecución

### Modo Desarrollo (con hot-reload)

```bash
npm run dev
```

### Modo Producción

```bash
npm run build
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 Documentación API

Una vez iniciado el servidor, accede a la documentación interactiva Swagger:

**URL**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Desde allí podrás:
- Ver todos los endpoints disponibles
- Probar las peticiones directamente desde el navegador
- Ver los esquemas de datos y respuestas

### 📮 Importar a Postman

Hay **3 formas** de importar los endpoints a Postman:

#### Opción 1: Colección Pre-configurada (Más Fácil)
1. En Postman, click en **Import**
2. Arrastra el archivo `postman_collection.json` desde la raíz del proyecto
3. ¡Listo! Tendrás todos los endpoints con ejemplos

#### Opción 2: Desde URL (Con servidor corriendo)
1. Inicia el servidor: `npm run dev`
2. En Postman, click en **Import** → **Link**
3. Pega: `http://localhost:3000/api-docs/openapi.json`
4. Click en **Continue** → **Import**

#### Opción 3: Desde Swagger UI
1. Abre [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
2. En Postman, click en **Import** → **Link**
3. Pega la URL de Swagger
4. Postman detectará automáticamente la especificación OpenAPI

## 🔌 Endpoints Principales

### Health Check

```http
GET /health
```

Verifica el estado del servidor.

### Crear Ticket

```http
POST /api/tickets
Content-Type: application/json

{
  "description": "No puedo iniciar sesión, la pantalla se queda en blanco"
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "description": "No puedo iniciar sesión, la pantalla se queda en blanco",
    "priority": "ALTA",
    "status": "ABIERTO",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Obtener Todos los Tickets

```http
GET /api/tickets
```

**Filtros opcionales**:
- `?status=ABIERTO` - Filtrar por estado
- `?priority=ALTA` - Filtrar por prioridad

### Obtener Ticket por ID

```http
GET /api/tickets/:id
```

### Actualizar Estado de Ticket

```http
PATCH /api/tickets/:id/status
Content-Type: application/json

{
  "status": "EN_PROCESO"
}
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/
│   └── tickets/
│       ├── ticket.types.ts       # Interfaces y tipos
│       ├── ticket.repository.ts  # Capa de datos (in-memory)
│       ├── ticket.service.ts     # Lógica de negocio
│       ├── ticket.controller.ts  # Manejo de requests HTTP
│       └── ticket.routes.ts      # Definición de rutas
├── services/
│   └── gemini.service.ts         # Integración con Gemini AI
├── config/
│   └── swagger.ts                # Configuración de Swagger
├── middleware/
│   ├── error.middleware.ts       # Manejo de errores
│   ├── logger.middleware.ts      # Logging de requests
│   └── validation.middleware.ts  # Validación de inputs
├── app.ts                        # Configuración de Express
└── server.ts                     # Punto de entrada
```

### Principios Aplicados

- **SOLID**: Cada módulo tiene una responsabilidad única
- **Clean Architecture**: Separación clara entre capas
- **Dependency Injection**: Servicios desacoplados
- **Repository Pattern**: Abstracción de la capa de datos
- **Validation Middleware**: Validaciones separadas de controladores

### Flujo de Request

```
Request → Middleware (Logging) → Middleware (Validation) → Controller → Service → Repository
```

**Ejemplo de validación**:
- Las rutas aplican middleware de validación antes de llegar al controlador
- Los controladores solo manejan lógica de negocio
- Validaciones reutilizables y testeables por separado

## 🤖 Cómo Funciona el Análisis de IA

1. El usuario envía un ticket con una descripción
2. El servicio `gemini.service.ts` recibe el texto
3. Se construye un prompt estructurado con criterios de clasificación
4. Gemini AI analiza el contenido y retorna una prioridad
5. El ticket se guarda con la prioridad asignada

### Criterios de Prioridad

- **CRITICA**: Sistema caído, pérdida financiera, brecha de seguridad
- **ALTA**: Funcionalidad principal rota, sistema operativo
- **MEDIA**: Bug no bloqueante, consulta compleja
- **BAJA**: Consulta general, mejora, bug menor

## 🧪 Ejemplos de Uso

### Ejemplo 1: Ticket Crítico

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "description": "El sistema de pagos está caído, no podemos procesar transacciones"
  }'
```

**Prioridad esperada**: `CRITICA`

### Ejemplo 2: Ticket de Baja Prioridad

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "description": "¿Cómo puedo cambiar el color del tema?"
  }'
```

**Prioridad esperada**: `BAJA`

## 🔧 Scripts Disponibles

```bash
npm run dev              # Inicia servidor en modo desarrollo
npm run build            # Compila TypeScript a JavaScript
npm start                # Inicia servidor en modo producción
npm test                 # Ejecuta tests con cobertura
npm run test:watch       # Tests en modo watch
npm run test:unit        # Solo tests unitarios
npm run test:integration # Solo tests de integración
npm run lint             # Ejecuta ESLint
npm run format           # Formatea código con Prettier
```

## 🧪 Testing

El proyecto incluye tests unitarios y de integración con **>80% de cobertura**.

### Ejecutar Tests

```bash
# Todos los tests con reporte de cobertura
npm test

# Tests en modo watch (desarrollo)
npm run test:watch

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration
```

### Cobertura de Tests

- ✅ **Repository Layer**: CRUD completo, filtros, validaciones
- ✅ **Service Layer**: Lógica de negocio con mocks de IA
- ✅ **Middleware Layer**: Todas las validaciones
- ✅ **Integration Tests**: Todos los endpoints HTTP

Ver documentación completa en [`tests/README.md`](tests/README.md)

### Reporte de Cobertura

Después de ejecutar `npm test`, abre `coverage/lcov-report/index.html` en tu navegador para ver el reporte detallado.

## 🌐 Variables de Entorno

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `GEMINI_API_KEY` | API Key de Google Gemini | ✅ | - |
| `PORT` | Puerto del servidor | ❌ | 3000 |
| `NODE_ENV` | Entorno de ejecución | ❌ | development |

## 📦 Dependencias Principales

- **express**: Framework web
- **@google/generative-ai**: SDK de Gemini AI
- **typescript**: Lenguaje tipado
- **swagger-ui-express**: Documentación interactiva
- **dotenv**: Gestión de variables de entorno
- **cors**: Manejo de CORS

## 🔒 Seguridad

- Validación de entrada en todos los endpoints
- Sanitización de datos
- Manejo seguro de API Keys mediante variables de entorno
- Configuraciones de seguridad en Gemini AI (filtros de contenido)

## 🚦 Estado de Tickets

Los tickets pueden tener los siguientes estados:

- `ABIERTO`: Ticket recién creado
- `EN_PROCESO`: Ticket siendo atendido
- `CERRADO`: Ticket resuelto

## 📝 Notas Importantes

- Los datos se almacenan en memoria y se pierden al reiniciar el servidor
- La API Key de Gemini debe mantenerse privada y nunca commitear al repositorio
- El análisis de prioridad puede tardar 1-3 segundos dependiendo de la API de Gemini
- En caso de error de la API de Gemini, se asigna prioridad `MEDIA` por defecto


