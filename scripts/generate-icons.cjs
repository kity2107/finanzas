// Genera iconos PNG solidos para el PWA sin dependencias externas
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBuffer, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, typeBuffer, data, crcBuf])
}

function createSolidPNG(size, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  // Filas: 1 byte filtro + size*3 bytes RGB
  const raw = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    const base = y * (1 + size * 3)
    raw[base] = 0 // filtro None
    for (let x = 0; x < size; x++) {
      raw[base + 1 + x * 3]     = r
      raw[base + 1 + x * 3 + 1] = g
      raw[base + 1 + x * 3 + 2] = b
    }
  }

  const idat = zlib.deflateSync(raw)

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const publicDir = path.join(__dirname, '..', 'public')
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

// emerald-500: #10b981 = rgb(16, 185, 129)
const [r, g, b] = [16, 185, 129]

for (const size of [192, 512]) {
  const buf = createSolidPNG(size, r, g, b)
  const outPath = path.join(publicDir, `icon-${size}.png`)
  fs.writeFileSync(outPath, buf)
  console.log(`Creado: public/icon-${size}.png (${size}x${size})`)
}
