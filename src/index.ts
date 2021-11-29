import express from 'express'

import fileRouter from './router/files'

const app = express()
const port = 4000

app.use('/file', fileRouter)

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`)
})
