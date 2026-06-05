## Context

El Dashboard ya muestra ahorros totales y por destino, pero no hay ningún indicador de si el ahorro del mes actual es suficiente en relación al ingreso. La configuración vive en localStorage para evitar una hoja extra en Sheets y no requerir Sheets API adicional.

## Goals / Non-Goals

**Goals:**
- Card auto-contenida que calcula y muestra el progreso de ahorro del mes
- Configuración persistente en localStorage (meta %, sueldo base opcional)
- Sueldo auto-detectado desde ingresos del mes si no hay sueldo base manual
- Feedback visual semafórico inmediato

**Non-Goals:**
- Histórico de meses anteriores
- Metas por destino de ahorro
- Notificaciones push si no se alcanza la meta
- Sincronizar configuración entre dispositivos

## Decisions

### D1: Configuración en localStorage, no en Sheets

**Decisión**: `finanzas_meta_ahorro` en localStorage con estructura `{ metaPct: 20, sueldoBase: null }`.

**Alternativa descartada**: Nueva hoja "Config" en Sheets. Overkill para dos valores escalares; agrega latencia al login y complejidad de inicialización.

### D2: Auto-detección de sueldo = suma de ingresos "Sueldo" del mes

**Decisión**: Si `sueldoBase === null`, el sueldo efectivo es la suma de todos los ingresos del mes con `categoria === "Sueldo"`. Si no hay ninguno, la card se oculta (no hay base para calcular meta).

**Alternativa descartada**: Usar total de todos los ingresos del mes. Distorsiona la meta si hay ingresos extraordinarios (freelance, venta). "Sueldo" es el ingreso recurrente esperado.

### D3: Ahorrado del mes = solo depósitos en Ahorros del mes

**Decisión**: `ahorros.filter(a => a.tipo === 'deposito' && a.fecha.startsWith(curMonthStr)).reduce(sum)`. Los retiros no cuentan.

### D4: Modal inline en la misma card (no navegación separada)

**Decisión**: Botón ⚙ togglea un formulario inline dentro de la card. Dos inputs: porcentaje (1–100) y sueldo base (número o vacío). Guardar cierra el formulario y actualiza el estado.

**Alternativa descartada**: Tab o página de configuración separada. La meta de ahorro no justifica una pantalla nueva; el acceso contextual desde la card es más natural.

### D5: Estado de configuración en App.jsx

**Decisión**: `metaAhorro` state en App.jsx (objeto `{ metaPct, sueldoBase }`), inicializado desde localStorage al montar. Se pasa como prop a `MetaAhorroCard`.

## Risks / Trade-offs

- **localStorage borrado** → la card vuelve a defaults (20%, sin sueldo base). Sin pérdida de datos críticos.
- **Mes sin ingresos "Sueldo"** → card oculta. No es un error, es el comportamiento esperado cuando no hay dato base.
- **Configuración no sincronizada entre dispositivos** → consecuencia de D1. Aceptable para v1.
