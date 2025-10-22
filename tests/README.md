# Tests

Este proyecto incluye tests unitarios y de integración para asegurar la calidad del código.

## 🧪 Estructura de Tests

```
tests/
├── unit/                           # Tests unitarios (aislados)
│   ├── repository/
│   │   └── ticket.repository.test.ts
│   ├── services/
│   │   └── ticket.service.test.ts
│   └── middleware/
│       └── validation.middleware.test.ts
│
└── integration/                    # Tests de integración (end-to-end)
    └── tickets.integration.test.ts
```

## 🚀 Ejecutar Tests

### Todos los tests con cobertura
```bash
npm test
```

### Solo tests unitarios
```bash
npm run test:unit
```

### Solo tests de integración
```bash
npm run test:integration
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

## 📊 Cobertura de Tests

Los tests cubren:

### ✅ Repository Layer (100%)
- ✅ Crear tickets con ID auto-incremental
- ✅ Obtener todos los tickets
- ✅ Buscar por ID
- ✅ Actualizar estado
- ✅ Filtrar por estado y prioridad
- ✅ Limpiar repositorio

### ✅ Service Layer (100%)
- ✅ Crear ticket con análisis de IA (mockeado)
- ✅ Obtener todos los tickets
- ✅ Obtener ticket por ID
- ✅ Actualizar estado de ticket
- ✅ Filtrar por estado y prioridad
- ✅ Sanitización de descripción (trim)

### ✅ Middleware Layer (100%)
- ✅ Validación de descripción (requerida, string, max 5000 chars)
- ✅ Validación de ID (número positivo)
- ✅ Validación de estado (ABIERTO, EN_PROCESO, CERRADO)
- ✅ Validación de filtros (status, priority)
- ✅ Sanitización de inputs

### ✅ Integration Tests (Endpoints)
- ✅ POST /api/tickets - Crear ticket
- ✅ GET /api/tickets - Listar todos
- ✅ GET /api/tickets?status=X - Filtrar por estado
- ✅ GET /api/tickets?priority=X - Filtrar por prioridad
- ✅ GET /api/tickets/:id - Obtener por ID
- ✅ PATCH /api/tickets/:id/status - Actualizar estado
- ✅ GET /health - Health check
- ✅ Flujo completo de ciclo de vida de ticket

## 🎯 Estrategia de Testing

### Unit Tests
- **Objetivo**: Probar cada componente de forma aislada
- **Mocks**: Se mockean todas las dependencias externas
- **Velocidad**: Muy rápidos (< 100ms)
- **Cobertura**: Lógica de negocio y validaciones

### Integration Tests
- **Objetivo**: Probar endpoints completos
- **Mocks**: Solo se mockea Gemini AI (para evitar llamadas reales)
- **Velocidad**: Rápidos (< 500ms)
- **Cobertura**: Flujo HTTP completo (request → response)

## 📝 Ejemplos de Tests

### Test Unitario (Repository)
```typescript
it("should create a ticket with auto-generated ID", () => {
  const ticket = ticketRepository.create({
    description: "Test",
    priority: "MEDIA",
    status: "ABIERTO",
  });

  expect(ticket.id).toBe(1);
  expect(ticket.createdAt).toBeInstanceOf(Date);
});
```

### Test de Integración (Endpoint)
```typescript
it("should create a ticket with AI-analyzed priority", async () => {
  jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("ALTA");

  const response = await request(app)
    .post("/api/tickets")
    .send({ description: "Cannot login" })
    .expect(201);

  expect(response.body.data.priority).toBe("ALTA");
});
```

## 🔧 Configuración

### Jest Config (`jest.config.js`)
- **Preset**: ts-jest (para TypeScript)
- **Environment**: node
- **Coverage**: Reportes en text, lcov, html
- **Mocks**: Auto-clear, reset, restore

### Mocks
- **Gemini Service**: Mockeado en tests de integración para evitar llamadas reales a la API
- **Repository**: Mockeado en tests de service para aislar lógica de negocio

## ✨ Buenas Prácticas Aplicadas

1. **AAA Pattern** (Arrange, Act, Assert)
   ```typescript
   // Arrange
   const mockData = { ... };
   
   // Act
   const result = service.method(mockData);
   
   // Assert
   expect(result).toBe(expected);
   ```

2. **Isolation**: Cada test es independiente
   ```typescript
   beforeEach(() => {
     ticketRepository.clear();
     jest.clearAllMocks();
   });
   ```

3. **Descriptive Names**: Tests auto-documentados
   ```typescript
   it("should return 400 when description is empty", ...)
   ```

4. **Edge Cases**: Tests para casos límite
   - Valores vacíos
   - Valores inválidos
   - IDs no existentes
   - Límites de caracteres

5. **Happy Path + Error Cases**: Ambos escenarios cubiertos

## 📈 Reporte de Cobertura

Después de ejecutar `npm test`, se genera un reporte en:
- **Terminal**: Resumen de cobertura
- **HTML**: `coverage/lcov-report/index.html` (abrir en navegador)

### Objetivo de Cobertura
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

## 🚨 Troubleshooting

### Error: Cannot find module
```bash
npm install
```

### Tests fallan por timeout
- Verificar que Gemini service esté mockeado
- Aumentar timeout en jest.config.js si es necesario

### Coverage no se genera
```bash
rm -rf coverage/
npm test
```

## 🔄 CI/CD Integration

Los tests están listos para integrarse en pipelines de CI/CD:

```yaml
# Ejemplo GitHub Actions
- name: Run tests
  run: npm test

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
