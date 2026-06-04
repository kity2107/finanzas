## ADDED Requirements

### Requirement: Checkbox pago con tarjeta en cuotas
El formulario de gastos SHALL incluir un checkbox "Pago con tarjeta" que habilita el modo de cuotas.

#### Scenario: Checkbox desactivado por defecto
- **WHEN** el usuario abre el formulario de gastos
- **THEN** el checkbox "Pago con tarjeta" SHALL estar desmarcado y el selector de cuotas SHALL estar oculto

#### Scenario: Activar modo cuotas
- **WHEN** el usuario marca el checkbox "Pago con tarjeta"
- **THEN** el formulario SHALL mostrar el selector de cantidad de cuotas

#### Scenario: Desactivar modo cuotas
- **WHEN** el usuario desmarca el checkbox "Pago con tarjeta"
- **THEN** el selector de cuotas SHALL ocultarse y el formulario vuelve al flujo normal de gasto

### Requirement: Selector de cantidad de cuotas
Cuando el modo cuotas está activo, el formulario SHALL mostrar un selector con opciones: 1, 3, 6, 12, 18, 24.

#### Scenario: Opciones disponibles
- **WHEN** el selector de cuotas está visible
- **THEN** SHALL ofrecer exactamente las opciones: 1, 3, 6, 12, 18, 24

#### Scenario: Valor por defecto
- **WHEN** el selector de cuotas se muestra por primera vez
- **THEN** SHALL tener seleccionado el valor 3 por defecto

### Requirement: Monto por cuota informativo
Cuando el modo cuotas está activo y hay monto ingresado, el formulario SHALL mostrar el monto por cuota calculado.

#### Scenario: Mostrar monto por cuota
- **WHEN** el usuario ingresa un monto y selecciona N cuotas
- **THEN** el formulario SHALL mostrar "X cuotas de $Y" donde Y = monto / N

### Requirement: Guardar gasto en cuotas
Al enviar el formulario con modo cuotas activo, el sistema SHALL ejecutar el flujo de registro de cuotas en lugar del flujo normal de gasto.

#### Scenario: Submit con cuotas activas
- **WHEN** el usuario completa el formulario con "Pago con tarjeta" marcado y N cuotas seleccionadas
- **THEN** el sistema SHALL crear el registro en `Cuotas` y generar N filas en `Gastos`

#### Scenario: Submit sin cuotas (flujo normal)
- **WHEN** el usuario completa el formulario con "Pago con tarjeta" desmarcado
- **THEN** el sistema SHALL usar el flujo normal de guardado en `Gastos` (sin cambios)

#### Scenario: Validación antes de guardar
- **WHEN** el modo cuotas está activo y faltan campos requeridos (descripción, monto, categoría)
- **THEN** el formulario SHALL no permitir el envío y mostrar mensaje de error
