## 1. Google Sheets API — Hoja Cuotas

- [x] 1.1 Agregar función `ensureCuotasSheet(spreadsheetId, token)` en `sheetsApi.js` que crea la hoja `Cuotas` con headers si no existe (afecta: hoja `Cuotas`)
- [x] 1.2 Agregar función `saveCuota(spreadsheetId, token, cuota)` en `sheetsApi.js` que escribe una fila en `Cuotas` con campos: ID, Descripción, MontoTotal, MontoCuota, CuotasTotal, CuotaActual, FechaInicio, Categoría, Estado
- [x] 1.3 Agregar función `getCuotas(spreadsheetId, token)` en `sheetsApi.js` que lee todas las filas de `Cuotas` y filtra `Estado !== "deleted"`
- [x] 1.4 Agregar función `saveGastosBatch(spreadsheetId, token, gastos[])` en `sheetsApi.js` que escribe N filas en `Gastos` en una sola llamada `batchUpdate`

## 2. Inicialización — App.jsx

- [x] 2.1 En el flujo de inicialización del spreadsheet (donde se crean `Gastos`, `Ingresos`, etc.), llamar también a `ensureCuotasSheet` para spreadsheets existentes y nuevos
- [x] 2.2 Cargar cuotas al iniciar sesión: llamar `getCuotas` y guardar en estado `cuotas` en `App.jsx`
- [x] 2.3 Pasar `cuotas` y handler `onAddCuota` como props a los componentes que los necesiten

## 3. ExpenseForm — Campos de cuotas

- [x] 3.1 Agregar checkbox "Pago con tarjeta" al formulario `ExpenseForm.jsx` con estado local `pagoConTarjeta` (false por defecto)
- [x] 3.2 Agregar selector de cuotas con opciones [1, 3, 6, 12, 18, 24] visible solo cuando `pagoConTarjeta === true`, con valor por defecto 3
- [x] 3.3 Mostrar texto informativo "X cuotas de $Y" cuando hay monto ingresado y modo cuotas activo
- [x] 3.4 En `handleSubmit`: si `pagoConTarjeta === true`, llamar handler de cuotas en lugar del handler normal de gasto

## 4. Lógica de guardado de cuotas — App.jsx

- [x] 4.1 Implementar `handleAddCuota(datosCuota)` en `App.jsx` que: (1) construye el objeto cuota con `ID = Date.now().toString()`, `CuotaActual = 0`; (2) llama `saveCuota`; (3) genera array de N gastos con fechas y descripciones "Desc - cuota X/N"; (4) llama `saveGastosBatch`
- [x] 4.2 Calcular fechas de cuotas: cuota 1 = mes de FechaInicio día 01, cuota 2 = mes siguiente día 01, etc. (usar manipulación de Date sin librerías extra)
- [x] 4.3 Actualizar estado local `cuotas` en App.jsx después de guardar exitosamente
- [x] 4.4 Mostrar toast de éxito "X cuotas registradas" o toast de error si falla alguna escritura

## 5. Dashboard — Card de compromisos

- [x] 5.1 Crear componente `CuotasCard.jsx` que recibe `cuotas[]` como prop
- [x] 5.2 Calcular cuotas restantes: para cada cuota activa, determinar `cuotasPagadas` según meses transcurridos desde `FechaInicio` vs fecha actual
- [x] 5.3 Calcular total adeudado: suma de `MontoCuota * (CuotasTotal - cuotasPagadas)` para cuotas con cuotas futuras
- [x] 5.4 Calcular monto próximo mes: suma de `MontoCuota` de cuotas donde queda al menos 1 cuota pendiente el mes siguiente
- [x] 5.5 Mostrar card solo si hay compromisos activos; ocultar si no hay cuotas pendientes
- [x] 5.6 Agregar `CuotasCard` al Dashboard pasando prop `cuotas` desde App.jsx
