## Context

`GastosFijos` almacena gastos recurrentes (alquiler, Netflix, etc.) pero son entidades de configuración, no registros contables. Hoy el usuario debe ir al formulario y cargar cada uno manualmente cada mes. La app no tiene backend ni cron jobs — toda la lógica corre en el browser en el momento del login.

## Goals / Non-Goals

**Goals:**
- Auto-insertar en `Gastos` una fila por cada `GastoFijo` activo al iniciar sesión en un nuevo mes
- Evitar duplicados si el usuario abre la app varias veces en el mismo mes
- Notificar al usuario cuántos gastos se generaron

**Non-Goals:**
- Procesar meses pasados (solo el mes actual)
- Permitir cancelar/deshacer la auto-generación
- Soportar gastos fijos con frecuencia distinta a mensual

## Decisions

### D1: Flag de mes procesado en localStorage

**Decisión**: Usar clave `GASTOS_FIJOS_MES_KEY` en localStorage con valor `YYYY-MM`. Si el valor coincide con el mes actual, no procesar.

**Alternativa descartada**: Detectar duplicados leyendo `Gastos` en Sheets y buscando IDs con prefijo `fijo_`. Requiere una API call extra en cada login aunque ya esté procesado. localStorage es O(1) y no consume cuota de API.

**Clave**: `finanzas_gastos_fijos_mes` (constante UPPERCASE en sheetsApi.js)

### D2: ID determinista para deduplicación

**Decisión**: El ID de cada gasto auto-generado es `fijo_${gastoFijo.id}_${YYYY-MM}`. Si por alguna razón el localStorage se borra y se vuelve a ejecutar, el append duplicaría. Para mitigar, verificar IDs existentes en `Gastos` del mes antes de insertar.

**Alternativa descartada**: Solo depender de localStorage sin verificación en Sheets. Frágil: el usuario puede borrar el storage o usar otro dispositivo.

**Flujo**: leer gastos del mes actual → filtrar IDs con prefijo `fijo_` → solo insertar los que faltan.

### D3: Fecha del gasto = día de vencimiento del mes actual

**Decisión**: Usar `YYYY-MM-${DíaVencimiento}` como fecha del gasto generado, con cap al último día del mes.

**Alternativa descartada**: Usar día 1 del mes. El `DíaVencimiento` ya está en `GastosFijos` y es más preciso para el usuario.

### D4: Notificación en App.jsx con estado local

**Decisión**: `handleLogin` retorna cuántos gastos se generaron. App.jsx guarda `gastosFijosGenerados` en estado y muestra un banner temporal (auto-dismiss 4s). Se integra con el banner de instalación existente (no se muestran simultáneamente).

## Risks / Trade-offs

- **localStorage borrado** → la verificación por IDs en Sheets cubre este caso, al costo de una API call extra por login.
- **Gastos fijos con DíaVencimiento > días del mes** → cap al último día: `new Date(year, month, 0).getDate()`.
- **Primer mes de uso** → el mes se marca como procesado aunque no haya gastos fijos configurados todavía. No es un problema: si el usuario agrega gastos fijos después, los verá el mes siguiente.
