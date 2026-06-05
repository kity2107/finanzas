## 1. App.jsx — Estado y configuración

- [x] 1.1 Agregar constante `META_AHORRO_KEY = 'finanzas_meta_ahorro'` en `App.jsx`
- [x] 1.2 Agregar estado `metaAhorro` inicializado desde localStorage: `JSON.parse(localStorage.getItem(META_AHORRO_KEY)) || { metaPct: 20, sueldoBase: null }`
- [x] 1.3 Agregar handler `handleSaveMetaAhorro({ metaPct, sueldoBase })` que persiste en localStorage y actualiza estado `metaAhorro`
- [x] 1.4 Pasar `metaAhorro`, `ingresos`, `ahorros` y `onSaveMetaAhorro` como props a `MetaAhorroCard` desde el render del Dashboard

## 2. MetaAhorroCard.jsx — Lógica de cálculo

- [x] 2.1 Crear componente `MetaAhorroCard.jsx` que recibe props: `metaAhorro`, `ingresos`, `ahorros`, `onSave`
- [x] 2.2 Calcular `sueldoEfectivo`: si `metaAhorro.sueldoBase > 0` usar ese valor; si no, sumar ingresos del mes con `categoria === 'Sueldo'`
- [x] 2.3 Calcular `ahorradoMes`: suma de `ahorros` del mes actual con `tipo === 'deposito'`
- [x] 2.4 Calcular `metaMonto = sueldoEfectivo * metaAhorro.metaPct / 100` y `progresoPct = (ahorradoMes / metaMonto) * 100`
- [x] 2.5 Si `sueldoEfectivo === 0`, retornar `null` (no renderizar card)

## 3. MetaAhorroCard.jsx — UI de la card

- [x] 3.1 Renderizar card con título "Meta de ahorro", valores `ahorradoMes` y `metaMonto` formateados
- [x] 3.2 Renderizar barra de progreso con ancho `min(progresoPct, 100)%` y colores: verde (`progresoPct >= 100`), amarillo (`>= 60`), rojo (`< 60`)
- [x] 3.3 Mostrar porcentaje de progreso en texto (ej: "73%") con mismo color semafórico
- [x] 3.4 Agregar botón ⚙ que togglea estado local `showConfig`

## 4. MetaAhorroCard.jsx — Formulario de configuración inline

- [x] 4.1 Renderizar formulario inline cuando `showConfig === true`: input numérico para `metaPct` (1–100) e input para `sueldoBase` (número o vacío)
- [x] 4.2 Al guardar: llamar `onSave({ metaPct: parseInt(val), sueldoBase: val || null })` y cerrar formulario
- [x] 4.3 Mostrar hint bajo campo sueldo base: "Vacío = auto-detectar desde ingresos del mes"

## 5. Dashboard.jsx — Integración

- [x] 5.1 Importar `MetaAhorroCard` en `Dashboard.jsx`
- [x] 5.2 Agregar `metaAhorro` y `onSaveMetaAhorro` a la firma de props de `Dashboard`
- [x] 5.3 Renderizar `<MetaAhorroCard>` en el Dashboard, ubicada después de la card principal de balance
