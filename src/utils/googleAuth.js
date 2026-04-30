const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly'

export function loadGoogleIdentityServices() {
  return new Promise((resolve) => {
    if (window.google?.accounts) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

export function getAccessToken(clientId) {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID no configurado. Copia .env.example a .env y completa el valor.'))
      return
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.access_token)
        }
      },
    })
    client.requestAccessToken()
  })
}

export async function getUserInfo(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}
