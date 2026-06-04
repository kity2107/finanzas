## 1. sheetsApi.js — Funciones de auto-generación

- [x] 1.1 Agregar constante `GASTOS_FIJOS_MES_KEY = 'finanzas_gastos_fijos_mes'` en `sheetsApi.js`
- [x] 1.2 Agregar función `getMesActual()` que retorna el string `YYYY-MM` del mes actual
- [x] 1.3 Agregar función `autoGenerarGastosFijos(token, spreadsheetId, gastosFijos)` que: lee gastos del mes actual de `Gastos`, filtra IDs existentes con prefijo `fijo_`, genera las filas faltantes y las inserta via append batch
- [x] 1.4 En `autoGenerarGastosFijos`: calcular fecha del gasto como `YYYY-MM-DD` usando `DíaVencimiento` con cap al último día del mes
- [x] 1.5 En `autoGenerarGastosFijos`: retornar cantidad de gastos insertados

## 2. App.jsx — Integración post-login

- [x] 2.1 Agregar estado `gastosFijosGenerados` (número, null por defecto) en `App.jsx`
- [x] 2.2 En `handleLogin`, después de cargar todos los datos: verificar `localStorage.getItem(GASTOS_FIJOS_MES_KEY)` vs mes actual
- [x] 2.3 Si mes no procesado: llamar `autoGenerarGastosFijos(token, sheetId, fijosData)`, actualizar estado `expenses` con los nuevos gastos, guardar mes en localStorage, setear `gastosFijosGenerados` con el count
- [x] 2.4 Si mes ya procesado: no llamar la función (skip completo)

## 3. App.jsx — Banner de notificación

- [x] 3.1 Agregar banner condicional en JSX: visible si `gastosFijosGenerados >= 1`, con texto "Se generaron N gastos fijos para [mes localizado]"
- [x] 3.2 Auto-dismiss del banner a los 4 segundos (setTimeout → `setGastosFijosGenerados(null)`)
- [x] 3.3 Agregar botón "×" para cerrar el banner manualmente
