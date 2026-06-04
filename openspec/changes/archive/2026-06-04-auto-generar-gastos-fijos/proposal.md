## Why

Los gastos fijos (alquiler, servicios, suscripciones) existen en `GastosFijos` pero no se registran automáticamente en `Gastos` cada mes, obligando al usuario a cargarlos a mano o simplemente olvidarse. La app debe generar estas entradas sola al abrir cada mes.

## What Changes

- Al completar el login, verificar si el mes actual ya fue procesado (flag en `localStorage`)
- Si no fue procesado: por cada `GastoFijo` activo, insertar una fila en `Gastos` para el mes actual (si no existe ya)
- Marcar el mes como procesado en `localStorage` para no duplicar
- Mostrar notificación: "Se generaron X gastos fijos para [mes]"

## Capabilities

### New Capabilities

- `gastos-fijos-auto`: Generación automática mensual de gastos fijos — detección de mes no procesado, inserción en `Gastos`, deduplicación, notificación al usuario

### Modified Capabilities

(ninguna)

## Impact

- `src/App.jsx`: lógica post-login que ejecuta la auto-generación
- `src/utils/sheetsApi.js`: función para insertar gastos fijos en batch y leer gastos existentes del mes
- `localStorage`: nueva clave `gastos_fijos_mes_procesado` (formato `YYYY-MM`)
- Hoja `Gastos`: nuevas filas con `ID = fijo_${gastoFijoId}_${YYYY-MM}` para poder deduplicar
