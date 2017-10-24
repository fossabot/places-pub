
const express = require('express')
const path = require('path')

const app = express()

app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'src')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

const DEFAULT_PORT = 8080
const port = (process.env.PORT) ? parseInt(process.env.PORT, 10) : DEFAULT_PORT

app.listen(port)

console.log(`Server listening on localhost:${port}`)
