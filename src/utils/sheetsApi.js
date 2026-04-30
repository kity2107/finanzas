const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const SPREADSHEET_KEY = 'finanzas_spreadsheet_id'

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function ensureExtraSheets(token, spreadsheetId) {
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties.title`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  const existing = (data.sheets || []).map(s => s.properties.title)

  const needed = [
    { title: 'Ingresos', headers: ['Fecha', 'Categoría', 'Descripción', 'Monto', 'ID', 'Estado'] },
    { title: 'Ahorros',  headers: ['Fecha', 'Descripción', 'Monto', 'Tipo', 'Destino', 'ID', 'Estado'] },
  ].filter(s => !existing.includes(s.title))

  if (needed.length === 0) return

  await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: needed.map(s => ({ addSheet: { properties: { title: s.title } } })) }),
  })

  await fetch(`${SHEETS_API}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: needed.map(s => ({ range: `${s.title}!A1`, values: [s.headers] })),
    }),
  })
}

export function getStoredSpreadsheetId() {
  return localStorage.getItem(SPREADSHEET_KEY)
}

function storeSpreadsheetId(id) {
  localStorage.setItem(SPREADSHEET_KEY, id)
}

async function createSpreadsheet(token) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: { title: 'Finanzas Personal' },
      sheets: [
        {
          properties: { title: 'Gastos' },
          data: [
            {
              rowData: [
                {
                  values: ['Fecha', 'Categoría', 'Descripción', 'Monto', 'ID', 'Estado'].map(v => ({
                    userEnteredValue: { stringValue: v },
                    userEnteredFormat: { textFormat: { bold: true } },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  })
  const data = await res.json()
  storeSpreadsheetId(data.spreadsheetId)
  return data.spreadsheetId
}

async function searchSpreadsheetInDrive(token) {
  const q = encodeURIComponent("name='Finanzas Personal' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false")
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  return data.files?.[0]?.id || null
}

export async function findOrCreateSpreadsheet(token) {
  // 1. Verificar caché local
  const stored = getStoredSpreadsheetId()
  if (stored) {
    const res = await fetch(`${SHEETS_API}/${stored}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) return stored
    localStorage.removeItem(SPREADSHEET_KEY)
  }

  // 2. Buscar en Drive por nombre (funciona cross-device)
  const found = await searchSpreadsheetInDrive(token)
  if (found) {
    storeSpreadsheetId(found)
    return found
  }

  // 3. Crear nuevo
  return createSpreadsheet(token)
}

export async function loadExpenses(token, spreadsheetId) {
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Gastos!A2:F?majorDimension=ROWS`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  const rows = data.values || []

  return rows
    .filter(row => row[5] !== 'deleted' && row[4]) // excluir eliminados y filas sin ID
    .map(row => ({
      fecha: row[0] || '',
      categoria: row[1] || '',
      descripcion: row[2] || '',
      monto: parseFloat(row[3]) || 0,
      id: row[4] || '',
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export async function addExpense(token, spreadsheetId, expense) {
  const id = Date.now().toString()
  const values = [[
    expense.fecha,
    expense.categoria,
    expense.descripcion,
    expense.monto,
    id,
    'active',
  ]]

  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Gastos!A:F:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ values }),
    }
  )

  return { ...expense, id }
}

// ── Ingresos ────────────────────────────────────────────────────────────────

export async function loadIngresos(token, spreadsheetId) {
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Ingresos!A2:F?majorDimension=ROWS`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  return (data.values || [])
    .filter(row => row[5] !== 'deleted' && row[4])
    .map(row => ({
      fecha: row[0] || '',
      categoria: row[1] || '',
      descripcion: row[2] || '',
      monto: parseFloat(row[3]) || 0,
      id: row[4] || '',
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export async function addIngreso(token, spreadsheetId, ingreso) {
  const id = Date.now().toString()
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Ingresos!A:F:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ values: [[ingreso.fecha, ingreso.categoria, ingreso.descripcion, ingreso.monto, id, 'active']] }),
    }
  )
  return { ...ingreso, id }
}

export async function deleteIngreso(token, spreadsheetId, ingresoId) {
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Ingresos!A:F`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const rows = (await res.json()).values || []
  const rowIndex = rows.findIndex(row => row[4] === ingresoId)
  if (rowIndex === -1) return
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Ingresos!F${rowIndex + 1}?valueInputOption=USER_ENTERED`,
    { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ values: [['deleted']] }) }
  )
}

// ── Ahorros ─────────────────────────────────────────────────────────────────

// Columnas Ahorros: A=Fecha B=Descripción C=Monto D=Tipo E=Destino F=ID G=Estado
export async function loadAhorros(token, spreadsheetId) {
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Ahorros!A2:G?majorDimension=ROWS`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  return (data.values || [])
    .filter(row => row[6] !== 'deleted' && row[5])
    .map(row => ({
      fecha:      row[0] || '',
      descripcion:row[1] || '',
      monto:      parseFloat(row[2]) || 0,
      tipo:       row[3] || 'deposito',
      destino:    row[4] || 'General',
      id:         row[5] || '',
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export async function addAhorro(token, spreadsheetId, ahorro) {
  const id = Date.now().toString()
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Ahorros!A:G:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ values: [[ahorro.fecha, ahorro.descripcion, ahorro.monto, ahorro.tipo, ahorro.destino, id, 'active']] }),
    }
  )
  return { ...ahorro, id }
}

export async function deleteAhorro(token, spreadsheetId, ahorroId) {
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Ahorros!A:G`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const rows = (await res.json()).values || []
  const rowIndex = rows.findIndex(row => row[5] === ahorroId)
  if (rowIndex === -1) return
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Ahorros!G${rowIndex + 1}?valueInputOption=USER_ENTERED`,
    { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ values: [['deleted']] }) }
  )
}

// ── Gastos (update / delete) ─────────────────────────────────────────────────

export async function updateExpense(token, spreadsheetId, expense) {
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Gastos!A:F`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const rows = (await res.json()).values || []
  const rowIndex = rows.findIndex(row => row[4] === expense.id)
  if (rowIndex === -1) return
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Gastos!A${rowIndex + 1}:F${rowIndex + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ values: [[expense.fecha, expense.categoria, expense.descripcion, expense.monto, expense.id, 'active']] }),
    }
  )
}

export async function deleteExpense(token, spreadsheetId, expenseId) {
  // Obtener todas las filas para encontrar la fila del gasto
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Gastos!A:F`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  const rows = data.values || []

  // rows[0] = cabeceras (fila 1), rows[1] = primer dato (fila 2), etc.
  const rowIndex = rows.findIndex(row => row[4] === expenseId)
  if (rowIndex === -1) return

  const sheetRowNumber = rowIndex + 1 // Google Sheets es 1-indexed

  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Gastos!F${sheetRowNumber}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ values: [['deleted']] }),
    }
  )
}
