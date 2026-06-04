## ADDED Requirements

### Requirement: Hoja Cuotas en Google Sheets
El sistema SHALL crear y mantener una hoja `Cuotas` en el spreadsheet con columnas: `ID | Descripción | MontoTotal | MontoCuota | CuotasTotal | CuotaActual | FechaInicio | Categoría | Estado`.

#### Scenario: Hoja creada en spreadsheet nuevo
- **WHEN** el usuario inicia sesión y el spreadsheet no tiene hoja `Cuotas`
- **THEN** el sistema SHALL crear la hoja `Cuotas` con los headers correspondientes

#### Scenario: Hoja ya existe
- **WHEN** el spreadsheet ya contiene la hoja `Cuotas`
- **THEN** el sistema SHALL no duplicar la hoja ni sobreescribir datos existentes

### Requirement: Registro de compra en cuotas
El sistema SHALL guardar una compra en cuotas como un registro en la hoja `Cuotas` con estado `"activa"`.

#### Scenario: Guardar nueva cuota
- **WHEN** el usuario confirma una compra con tarjeta en N cuotas
- **THEN** el sistema SHALL crear una fila en `Cuotas` con `CuotaActual = 0`, `CuotasTotal = N`, `MontoCuota = MontoTotal / N`, `Estado = "activa"`

#### Scenario: ID único
- **WHEN** se crea un registro de cuota
- **THEN** el `ID` SHALL ser `Date.now().toString()` y único en la hoja

### Requirement: Generación automática de gastos mensuales
Al registrar una compra en cuotas, el sistema SHALL generar N filas en la hoja `Gastos`, una por mes.

#### Scenario: Descripción con número de cuota
- **WHEN** se generan las filas de gastos para una compra de N cuotas con descripción "Televisor"
- **THEN** cada fila SHALL tener descripción `"Televisor - cuota X/N"` donde X es el número de cuota (1 a N)

#### Scenario: Fechas consecutivas
- **WHEN** se generan las filas de gastos con fecha de inicio YYYY-MM
- **THEN** la cuota 1 SHALL tener fecha YYYY-MM-01, la cuota 2 SHALL tener fecha del mes siguiente con día 01, y así sucesivamente

#### Scenario: Monto por cuota
- **WHEN** el monto total es M y hay N cuotas
- **THEN** cada fila en `Gastos` SHALL tener monto `M / N`

#### Scenario: Categoría heredada
- **WHEN** se generan las filas de gastos
- **THEN** cada fila SHALL heredar la categoría seleccionada en el formulario

### Requirement: Escritura atómica en Sheets
El sistema SHALL escribir el registro en `Cuotas` antes que las filas en `Gastos` en la misma sesión de guardado.

#### Scenario: Orden de escritura
- **WHEN** el usuario confirma la compra en cuotas
- **THEN** el sistema SHALL primero escribir en `Cuotas` y luego hacer batch write de N filas en `Gastos`

### Requirement: Card de compromisos de tarjeta en Dashboard
El sistema SHALL mostrar una card "Compromisos de tarjeta" en el Dashboard con total adeudado y cuotas activas.

#### Scenario: Card visible con cuotas activas
- **WHEN** existen registros en `Cuotas` con estado `"activa"` y cuotas restantes futuras
- **THEN** el Dashboard SHALL mostrar la card con total adeudado (suma de cuotas futuras) y monto por mes

#### Scenario: Card oculta sin compromisos
- **WHEN** no existen cuotas activas con cuotas futuras pendientes
- **THEN** la card SHALL no mostrarse o mostrar estado vacío

#### Scenario: Cálculo de total adeudado
- **WHEN** se calculan los compromisos
- **THEN** el total adeudado SHALL ser la suma de `MontoCuota * (CuotasTotal - cuotasPagadas)` para cada cuota activa, donde `cuotasPagadas` se calcula por meses transcurridos desde `FechaInicio`
