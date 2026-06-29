const fs = require('fs')
const f = 'dist-web/index.html'
const c = fs.readFileSync(f, 'utf8')
const base = process.env.BASE_PATH || ''
if (base) {
  const tag = `<head><base href="/${base}/">`
  fs.writeFileSync(f, c.replace('<head>', tag))
  console.log(`Base tag injected: ${tag}`)
} else {
  console.log('BASE_PATH not set, skipping base tag')
}
