## Context

La app guarda gastos en Google Sheets sin soporte para cuotas. Hoy un gasto de $12,000 en 6 cuotas requiere registrar 6 filas manualmente. No hay visibilidad de compromisos futuros de tarjeta.

La arquitectura actual: App.jsx como state container, `sheetsApi.js` para toda I/O con Sheets, un tab "add" con `ExpenseForm`, un tab "dashboard" con cards de resumen.

## Goals / Non-Goals

**Goals:**
- Permitir registrar una compra en cuotas desde `ExpenseForm`
- Auto-generar filas en `Gastos` para cada cuota mensual
- Persistir el registro padre en hoja `Cuotas`
- Mostrar resumen de compromisos futuros en Dashboard

**Non-Goals:**
- Editar o cancelar cuotas ya generadas (v1 solo crea)
- Notificaciones de vencimiento de tarjeta
- Soporte para cuotas en otras categorías (ingresos, ahorros)
- Cálculo de interés o recargo por cuotas

## Decisions

### D1: Hoja `Cuotas` separada de `Gastos`

**Decisión**: Crear hoja `Cuotas` con el registro padre de la compra. Las N cuotas viven como filas normales en `Gastos` con un prefijo en descripción.

**Alternativa descartada**: Guardar solo en `Gastos` con campo extra `cuotaId`. Requeriría columna nueva en hoja existente → riesgo de romper código de lectura/escritura actual. La hoja separada encapsula el cambio.

**Estructura `Cuotas`**:
```
A:ID | B:Descripción | C:MontoTotal | D:MontoCuota | E:CuotasTotal | F:CuotaActual | G:FechaInicio | H:Categoría | I:Estado
```
Estado: `"activa"` | `"completada"` | `"deleted"`

### D2: Generación inmediata de filas en `Gastos`

**Decisión**: Al guardar en `ExpenseForm`, hacer batch write a Sheets con todas las N filas de gastos + 1 fila en `Cuotas`, en una sola operación `batchUpdate`.

**Alternativa descartada**: Generar cuotas lazy (solo cuando llega el mes). Requeriría lógica de cron/schedule imposible sin backend.

**Formato descripción**: `"${descripcion} - cuota ${i}/${total}"` donde i va de 1 a N.

**Fechas**: cuota 1 = mes de `FechaInicio`, cuota 2 = mes+1, etc. Usar día 1 de cada mes para simplificar.

### D3: ID de cuotas vinculado con gastos via prefijo de descripción

**Decisión**: No agregar columna `cuotaId` en `Gastos`. El vínculo es implícito por descripción. Para v1 es suficiente: el dashboard solo necesita leer `Cuotas` para los totales, no hacer join.

### D4: Card de Dashboard lee solo hoja `Cuotas`

**Decisión**: La card "Compromisos de tarjeta" lee la hoja `Cuotas` directamente, filtra `Estado !== "deleted"` y calcula:
- Total adeudado: suma de `(CuotasTotal - CuotaActual) * MontoCuota` para cada cuota activa
- Cuotas próximas mes: suma de `MontoCuota` de cuotas donde `CuotaActual < CuotasTotal`

`CuotaActual` se incrementa automáticamente porque las filas en `Gastos` ya están creadas — en realidad no necesitamos rastrear qué cuotas se "pagaron". La card muestra cuotas futuras basándose en FechaInicio + CuotasTotal vs fecha actual.

## Risks / Trade-offs

- **Datos duplicados** → Las cuotas generadas en `Gastos` inflan los totales del mes correspondiente. Esto es intencional: cada cuota mensual es un gasto real. Riesgo: si el usuario borra una cuota de `Gastos` manualmente en Sheets, el registro en `Cuotas` queda desincronizado. Mitigación: soft delete solo vía app.

- **Batch write parcial** → Si la escritura falla a mitad, pueden quedar cuotas en `Gastos` sin registro en `Cuotas`. Mitigación: escribir primero `Cuotas`, luego `Gastos`; si falla el segundo, el registro padre queda huérfano pero no hay datos perdidos del usuario.

- **Hoja `Cuotas` no existe en spreadsheets previos** → Al inicializar, verificar existencia y crearla si falta (ya ocurre con otras hojas).
