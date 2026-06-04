## Why

Los gastos en cuotas con tarjeta de crédito son comunes pero actualmente no se pueden registrar como compromisos multi-mes: cada cuota se pierde como gasto manual o directamente no se registra. Se necesita modelar cuotas como entidades persistentes para tener visibilidad real de los compromisos futuros.

## What Changes

- Nueva hoja `Cuotas` en Google Sheets para registrar compras en cuotas
- `ExpenseForm` agrega opción "Pago con tarjeta en cuotas" con selector de cantidad (1, 3, 6, 12, 18, 24)
- Al guardar una compra en cuotas: se crea un registro en `Cuotas` y se generan N filas en `Gastos` (una por mes, con descripción "Nombre - cuota X/N")
- Nueva card en Dashboard "Compromisos de tarjeta" mostrando total adeudado y cuotas restantes por mes

## Capabilities

### New Capabilities

- `cuotas-tarjeta`: Gestión de compras en cuotas con tarjeta de crédito — registro, generación automática de gastos mensuales y visualización de compromisos futuros en el dashboard

### Modified Capabilities

- `expense-form`: El formulario de gastos incorpora campos opcionales para cuotas (checkbox tarjeta + selector de cuotas)

## Impact

- `src/utils/sheetsApi.js`: nuevas funciones para crear hoja `Cuotas`, guardar registro de cuota, leer cuotas activas
- `src/components/ExpenseForm.jsx`: campos adicionales para cuotas en tarjeta
- `src/components/Dashboard.jsx` (o equivalente): nueva card de compromisos de tarjeta
- `src/App.jsx`: lógica de estado para cuotas, llamadas a API al inicializar
- Google Sheets: nueva hoja `Cuotas` auto-creada junto al resto de hojas
