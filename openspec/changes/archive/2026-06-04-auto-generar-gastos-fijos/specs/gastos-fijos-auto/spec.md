## ADDED Requirements

### Requirement: Detección de mes no procesado
El sistema SHALL verificar al completar el login si el mes actual ya fue procesado mediante la clave `finanzas_gastos_fijos_mes` en localStorage.

#### Scenario: Mes ya procesado
- **WHEN** el valor en localStorage coincide con el mes actual (`YYYY-MM`)
- **THEN** el sistema SHALL omitir la auto-generación sin hacer llamadas a Sheets

#### Scenario: Mes no procesado
- **WHEN** el valor en localStorage no existe o difiere del mes actual
- **THEN** el sistema SHALL ejecutar el flujo de auto-generación de gastos fijos

### Requirement: Inserción de gastos fijos en Gastos
El sistema SHALL insertar en la hoja `Gastos` una fila por cada `GastoFijo` activo que no tenga ya un registro para el mes actual.

#### Scenario: Gastos fijos sin duplicados previos
- **WHEN** no existen filas en `Gastos` del mes con ID de formato `fijo_${id}_${YYYY-MM}`
- **THEN** el sistema SHALL insertar una fila por cada `GastoFijo` activo con ese ID

#### Scenario: Deduplicación parcial
- **WHEN** algunos gastos fijos ya tienen fila en `Gastos` para el mes y otros no
- **THEN** el sistema SHALL insertar solo los que faltan, sin tocar los existentes

#### Scenario: Sin gastos fijos configurados
- **WHEN** la lista de `GastosFijos` activos está vacía
- **THEN** el sistema SHALL marcar el mes como procesado sin insertar nada ni mostrar notificación

### Requirement: Fecha de gasto según día de vencimiento
Cada gasto auto-generado SHALL tener fecha `YYYY-MM-DD` donde DD es el `DíaVencimiento` del `GastoFijo`, con cap al último día del mes.

#### Scenario: Día de vencimiento válido para el mes
- **WHEN** `DíaVencimiento` es 15 y el mes tiene al menos 15 días
- **THEN** la fecha del gasto SHALL ser `YYYY-MM-15`

#### Scenario: Día de vencimiento mayor al mes
- **WHEN** `DíaVencimiento` es 31 y el mes es febrero (28 días)
- **THEN** la fecha del gasto SHALL ser `YYYY-MM-28`

### Requirement: Marcado de mes como procesado
Tras completar la inserción, el sistema SHALL guardar el mes actual en localStorage para evitar reprocesamiento.

#### Scenario: Guardar mes procesado
- **WHEN** la auto-generación finaliza (con o sin gastos insertados)
- **THEN** el sistema SHALL escribir `YYYY-MM` en `finanzas_gastos_fijos_mes`

#### Scenario: Persistencia entre sesiones
- **WHEN** el usuario cierra y reabre la app en el mismo mes
- **THEN** el flag en localStorage SHALL prevenir una nueva auto-generación

### Requirement: Notificación visual de gastos generados
El sistema SHALL mostrar al usuario un banner informativo cuando se generaron uno o más gastos fijos.

#### Scenario: Gastos generados exitosamente
- **WHEN** se insertan N gastos fijos (N ≥ 1) en `Gastos`
- **THEN** el sistema SHALL mostrar "Se generaron N gastos fijos para [mes localizado]" durante al menos 4 segundos

#### Scenario: Sin gastos nuevos que generar
- **WHEN** todos los gastos fijos ya existen para el mes (deduplicación completa)
- **THEN** el sistema SHALL NOT mostrar notificación
