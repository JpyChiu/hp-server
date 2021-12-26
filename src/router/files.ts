import { Request, Response, Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const fileRouter = Router()

enum OrderBy {
  lastModified = 'lastModified',
  size = 'size',
  fileName = 'fileName',
}

enum OrderByDirection {
  Descending = 'Descending',
  Ascending = 'Ascending',
}

interface getFileQuery {
  orderBy: OrderBy
  orderByDirection: OrderByDirection
  filterByName: string
}

const FIELDNAME = 'file'
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { '0': url } = req.params
    cb(null, './' + path.dirname(url))
  },
  filename: (req, _file, cb) => {
    const { '0': url } = req.params
    cb(null, path.basename(url))
  },
})
const createMiddleware = multer({
  storage: storage,
  fileFilter(req, _file, cb) {
    const { '0': url } = req.params
    fs.stat(url, err => {
      if (err) {
        cb(null, true)
      } else {
        cb(new Error('Existed file'))
      }
    })
  },
}).single(FIELDNAME)
const updateMiddleware = multer({
  storage: storage,
  fileFilter(req, _file, cb) {
    const { '0': url } = req.params
    fs.stat(url, (err, _stats) => {
      if (err) {
        cb(new Error('Nonexisted file'))
      } else {
        cb(null, true)
      }
    })
  },
}).single(FIELDNAME)

fileRouter.get('/*', (req: Request<any, any, any, getFileQuery>, res: Response) => {
  const { '0': url } = req.params
  const { orderBy, orderByDirection, filterByName } = req.query

  try {
    const domain = './' + url
    const files = fs
      .readdirSync(domain)
      .map(file => {
        const fileStat = fs.statSync(domain + file)
        const name = fileStat.isDirectory() ? `${file}/` : file
        return { name, lastModifiedTime: fileStat.mtime.getTime(), size: fileStat.size }
      })
      .filter(({ name }) => {
        if (filterByName) {
          return name.includes(filterByName)
        }
        return name
      })
      .sort((a, b) => {
        switch (orderBy) {
          case OrderBy.lastModified:
            return handleDirection(orderByDirection, a.lastModifiedTime, b.lastModifiedTime)
          case OrderBy.fileName:
            return handleDirection(orderByDirection, a.name, b.name)
          case OrderBy.size:
            return handleDirection(orderByDirection, a.size, b.size)
          default:
            return 0
        }
      })
      .map(({ name }) => name)

    const resData = {
      isDirectory: true,
      files,
    }
    res.send(resData)
  } catch (_error) {
    const options = {
      root: './',
    }
    res.sendFile(url, options, err => {
      if (err) {
        res.sendStatus(404)
      }
    })
  }
})

fileRouter.post('/*', (req: Request, res: Response) => {
  createMiddleware(req, res, err => {
    if (err) {
      return res.status(400).send('File already existed.')
    }
    return res.send('Add a file')
  })
})

fileRouter.patch('/*', (req: Request, res: Response) => {
  updateMiddleware(req, res, err => {
    if (err) {
      return res.status(400).send('File not existed.')
    }
    return res.send('Update the file')
  })
})

fileRouter.delete('/*', (req: Request, res: Response) => {
  const { '0': url } = req.params
  fs.rm(url, err => {
    if (err) {
      return res.status(404).send('File not existed.')
    }
    return res.sendStatus(204)
  })
})

const handleDirection = (direction: OrderByDirection, a: string | number, b: string | number): number => {
  if (direction == OrderByDirection.Descending) {
    if (a < b) {
      return 1
    } else {
      return -1
    }
  } else {
    if (a < b) {
      return -1
    } else {
      return 1
    }
  }
}

export default fileRouter
