const { ResponseError } = require('../../frameworks/common')

const path = require('path')
const { readdir } = require('fs')
const mime = require('mime-types')

module.exports = (dependecies) => {
  const {
    envConfig: { APP_CONTENT_PATH, APP_PAGER_LIMIT }
  } = dependecies

  const contentFilter = (list = [], type = 'images') => {
    return list.filter(itm => {
      const mimeType = mime.lookup(itm.path)
      if (type === 'images') {
        return mimeType && mimeType.split('/').includes('image')
      } else
        if (type === 'videos') {
          return mimeType && mimeType.split('/').includes('video')
        } else if (type === 'other') {
          return mimeType && !mimeType.split('/').includes('video') && !mimeType.split('/').includes('image')
        }
      return true
    }).map(itm => itm.name)
  }

  const execute = async ({ InstagramID, ContentType, page = 1 }) => {
    const contentPath = path.resolve(APP_CONTENT_PATH, InstagramID)
    const list = await new Promise((resolve, reject) => {
      readdir(contentPath, (err, files) => {
        if (err) {
          reject(new ResponseError(err.message, 500))
        }
        if (typeof files === 'undefined') {
          reject(new ResponseError('No content found', 404))
        }
        files = files?.filter(file => {
          return /^.DELETED_.+/.test(file) === false
        }).sort((a, b) => a.localeCompare(b))?.map(file => {
          return {
            name: file,
            path: path.resolve(contentPath, file)
          }
        }) ?? []
        resolve(contentFilter(files, ContentType))
      })
    })
    const total = list.length
    const pages = Math.ceil(total / APP_PAGER_LIMIT)
    page = parseInt(page)
    const hasNext = page < pages
    const hasPrev = page > 1
    return {
      pager: {
        total,
        pages,
        page,
        next: hasNext ? page + 1 : null,
        prev: hasPrev ? page - 1 : null
      },
      list: list.slice((page - 1) * APP_PAGER_LIMIT, page * APP_PAGER_LIMIT)
    }
  }

  return { execute }
}
