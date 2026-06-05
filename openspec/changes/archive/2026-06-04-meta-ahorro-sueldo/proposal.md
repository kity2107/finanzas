## Why

El usuario no tiene visibilidad de si está cumpliendo una meta de ahorro mensual en relación a su sueldo. Sin un objetivo concreto y un indicador visual, el ahorro queda sin contexto y es difícil saber si el mes fue bueno o malo financieramente.

## What Changes

- Nueva clave en `localStorage`: `finanzas_meta_ahorro` con campos `metaPct` (default 20) y `sueldoBase` (default null)
- Auto-detección del sueldo del mes desde `Ingresos` categoría "Sueldo" si `sueldoBase` es null
- Cálculo de ahorrado del mes: suma de depósitos en `Ahorros` del mes corriente
- Nueva card en Dashboard: barra de progreso ahorrado/meta con colores semafóricos (verde ≥100%, amarillo ≥60%, rojo <60%)
- Botón ⚙ en la card para configurar `metaPct` y `sueldoBase` manualmente via modal/formulario inline

## Capabilities

### New Capabilities

- `meta-ahorro`: Seguimiento de meta de ahorro mensual — configuración por localStorage, auto-detección de sueldo, cálculo de progreso y visualización con semáforo

### Modified Capabilities

(ninguna)

## Impact

- `src/components/MetaAhorroCard.jsx`: nuevo componente card + modal de configuración
- `src/components/Dashboard.jsx`: importar y renderizar `MetaAhorroCard`
- `localStorage`: nueva clave `finanzas_meta_ahorro` (objeto JSON)
- No hay cambios en Google Sheets ni en `sheetsApi.js`
