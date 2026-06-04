# Tareas — App Finanzas Personal

## En progreso / Próximas

### 1. Cuotas de tarjeta de crédito
**Prioridad**: Alta

- [ ] Nueva hoja `Cuotas` en Google Sheets con columnas: `ID | Descripción | MontoTotal | MontoCuota | CuotasTotal | CuotaActual | FechaInicio | Categoría | Estado`
- [ ] Checkbox "Pago con tarjeta" en `ExpenseForm`
- [ ] Campo selector de cuotas (1, 3, 6, 12, 18, 24) visible si tarjeta activada
- [ ] Al guardar: crear registro en `Cuotas` + generar N filas en `Gastos` (una por mes, descripción: "Nombre - cuota X/N")
- [ ] Card en Dashboard: "Compromisos de tarjeta" — total adeudado + cuotas restantes por mes

---

### 2. Auto-generar gastos fijos mensuales
**Prioridad**: Alta

- [ ] Al cargar la app (post-login), verificar si el mes actual ya fue procesado (flag en `localStorage`)
- [ ] Si no procesado: por cada `GastoFijo` activo, crear entrada en `Gastos` si no existe para el mes
- [ ] Marcar mes como procesado para no duplicar
- [ ] Notificación visual: "Se generaron X gastos fijos para [mes]"

---

### 3. Meta de ahorro basada en sueldo
**Prioridad**: Alta

- [ ] Config en `localStorage`: `{ meta_ahorro_pct: 20, sueldo_base: null }`
- [ ] Auto-detectar sueldo del mes desde `Ingresos` (categoría "Sueldo") si `sueldo_base` es null
- [ ] Calcular ahorrado del mes: suma de movimientos en `Ahorros` (solo depósitos) del mes corriente
- [ ] Nuevo card en Dashboard con barra de progreso: ahorrado / meta
  - Verde ≥ 100%, Amarillo ≥ 60%, Rojo < 60%
- [ ] Botón ⚙ para configurar % y sueldo base manualmente

---

## Backlog (a evaluar)

### Presupuestos por categoría
- Definir límite mensual por categoría de gasto
- Barra de progreso "Alimentación: $X / $Y"
- Alerta visual al superar 80%

### Ingresos recurrentes
- Marcar ingreso como recurrente (ej: sueldo mensual)
- Auto-generarlo cada mes igual que gastos fijos

### Metas de ahorro por destino
- "Auto: $5.000 de $50.000" con barra de progreso
- Integrado con la sección Ahorros existente

### Cierre de mes
- Snapshot mensual: balance, top gastos, comparación vs mes anterior
- Guardado en nueva hoja `Resúmenes`

### Exportar PDF / CSV
- Reporte mensual descargable
- Útil para contador o backup

### Filtro por rango de fechas libre
- Actualmente solo filtra por mes
- Agregar selector de fecha desde/hasta

### Categorías personalizables
- Hoy hardcodeadas en el código
- Permitir agregar/editar/eliminar categorías propias

---

## Completadas

_(ninguna aún)_
