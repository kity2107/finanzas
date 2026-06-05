## ADDED Requirements

### Requirement: Configuración de meta de ahorro en localStorage
El sistema SHALL persistir la configuración de meta de ahorro en localStorage bajo la clave `finanzas_meta_ahorro` con campos `metaPct` (entero 1–100, default 20) y `sueldoBase` (número o null).

#### Scenario: Inicialización con defaults
- **WHEN** no existe la clave `finanzas_meta_ahorro` en localStorage
- **THEN** el sistema SHALL usar `metaPct = 20` y `sueldoBase = null`

#### Scenario: Persistencia de configuración guardada
- **WHEN** el usuario guarda una configuración personalizada
- **THEN** el sistema SHALL leer esa configuración en la próxima carga sin modificarla

### Requirement: Auto-detección de sueldo del mes
Si `sueldoBase` es null, el sistema SHALL calcular el sueldo efectivo como la suma de ingresos del mes actual con categoría "Sueldo".

#### Scenario: Sueldo detectado desde ingresos
- **WHEN** `sueldoBase` es null y existen ingresos del mes con categoría "Sueldo"
- **THEN** el sueldo efectivo SHALL ser la suma de esos ingresos

#### Scenario: Sin sueldo detectable
- **WHEN** `sueldoBase` es null y no hay ingresos del mes con categoría "Sueldo"
- **THEN** la card de meta de ahorro SHALL no mostrarse

#### Scenario: Sueldo base manual prevalece
- **WHEN** `sueldoBase` tiene un valor numérico mayor a cero
- **THEN** el sueldo efectivo SHALL ser `sueldoBase` independientemente de los ingresos del mes

### Requirement: Cálculo de ahorrado del mes
El sistema SHALL calcular el ahorrado del mes como la suma de movimientos en `Ahorros` con `tipo = "deposito"` y fecha en el mes corriente.

#### Scenario: Solo depósitos del mes actual
- **WHEN** existen depósitos y retiros en Ahorros del mes
- **THEN** el ahorrado del mes SHALL incluir solo los depósitos, ignorando los retiros

#### Scenario: Sin depósitos en el mes
- **WHEN** no hay depósitos en Ahorros para el mes actual
- **THEN** el ahorrado del mes SHALL ser 0

### Requirement: Card de progreso de meta de ahorro en Dashboard
El sistema SHALL mostrar una card con barra de progreso que indique el porcentaje de la meta alcanzado.

#### Scenario: Progreso calculado correctamente
- **WHEN** el sueldo efectivo es S, la meta es M% y el ahorrado es A
- **THEN** el porcentaje de progreso SHALL ser `(A / (S * M / 100)) * 100`, con cap visual en 100%

#### Scenario: Color verde — meta cumplida
- **WHEN** el progreso es ≥ 100%
- **THEN** la barra y el indicador SHALL mostrarse en verde

#### Scenario: Color amarillo — progreso parcial
- **WHEN** el progreso es ≥ 60% y < 100%
- **THEN** la barra y el indicador SHALL mostrarse en amarillo/amber

#### Scenario: Color rojo — progreso bajo
- **WHEN** el progreso es < 60%
- **THEN** la barra y el indicador SHALL mostrarse en rojo

#### Scenario: Card oculta sin datos suficientes
- **WHEN** no hay sueldo efectivo calculable
- **THEN** la card SHALL no mostrarse en el Dashboard

### Requirement: Configuración manual desde la card
El sistema SHALL permitir al usuario configurar `metaPct` y `sueldoBase` directamente desde la card mediante un formulario inline.

#### Scenario: Abrir configuración
- **WHEN** el usuario toca el botón ⚙ en la card
- **THEN** el sistema SHALL mostrar un formulario inline con los valores actuales de `metaPct` y `sueldoBase`

#### Scenario: Guardar configuración válida
- **WHEN** el usuario ingresa `metaPct` entre 1 y 100 y toca Guardar
- **THEN** el sistema SHALL persistir en localStorage, actualizar el estado y cerrar el formulario

#### Scenario: Limpiar sueldo base para auto-detectar
- **WHEN** el usuario deja el campo sueldo base vacío y guarda
- **THEN** `sueldoBase` SHALL guardarse como null y la auto-detección SHALL activarse
