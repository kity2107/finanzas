const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const SPREADSHEET_KEY = 'finanzas_spreadsheet_id'

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
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

export async function findOrCreateSpreadsheet(token) {
  const stored = getStoredSpreadsheetId()
  if (stored) {
    const res = await fetch(`${SHEETS_API}/${stored}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) return stored
    // Si no existe, creamos uno nuevo
    localStorage.removeItem(SPREADSHEET_KEY)
  }
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
