const { ResponseError } = require('../../frameworks/common')

const path = require('path')
const { readdir, existsSync, readFileSync, statSync, createReadStream, unlinkSync, writeFileSync, fstat } = require('fs')
const mime = require('mime-types')
const CSVParser = require('csv-parser')
const CSVWriter = require('csv-writer')

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

  const execute = async ({ InstagramID }) => {
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
        resolve(contentFilter(files))
      })
    })
    const csvPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'posts_info.csv')
    const csvDeletedPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'deleted_posts_info.csv')
    const readStream = await new Promise((resolve, reject) => {
      const csvData = {
        list: [],
        deleted: []
      }
      createReadStream(csvPath)
        .pipe(CSVParser())
        .on('data', (data) => {
          const filePath = path.resolve(APP_CONTENT_PATH, InstagramID, data.filename)
          if (list.includes(data.filename) && existsSync(filePath)) {
            csvData.list.push({ ...data, postId: data[Object.keys(data)[0]] })
          } else {
            // DELETE
            // const deletedPath = path.resolve(APP_CONTENT_PATH, InstagramID, `.DELETED_${data.filename}`)
            unlinkSync(filePath)
            // csvData.deleted.push({ ...data, postId: data[Object.keys(data)[0]] })
          }
        })
        .on('end', () => {
          resolve(csvData)
        });
    })
    await new Promise((resolve, reject) => {
      if (readStream.list.length === 0) {
        resolve(readStream)
      }

      // Create new JSON File
      const jsonPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'posts_info.json')
      writeFileSync(jsonPath, JSON.stringify(readStream.list, null, 2))
      readStream.list = []
      resolve(readStream)
      // Update the original CSV file
      // const csvWriter = CSVWriter.createObjectCsvWriter({
      //   path: csvPath,
      //   header: [
      //     { id: 'postId', title: 'post_id' },
      //     { id: 'filename', title: 'filename' },
      //     { id: 'description', title: 'description' },
      //     { id: 'likes', title: 'likes' },
      //     { id: 'comments', title: 'comments' },
      //     { id: 'views', title: 'views' },
      //   ]
      // });
      // csvWriter.writeRecords(readStream.list)
      //   .then(() => {
      //     readStream.list = []
      //     resolve(readStream)
      //   });
    })
    // await new Promise((resolve, reject) => {
    //   if (readStream.deleted.length === 0) {
    //     resolve(readStream)
    //   }
    //   // Update the original CSV file
    //   const csvWriter = CSVWriter.createObjectCsvWriter({
    //     path: csvDeletedPath,
    //     header: [
    //       { id: 'postId', title: 'post_id' },
    //       { id: 'filename', title: 'filename' },
    //       { id: 'description', title: 'description' },
    //       { id: 'likes', title: 'likes' },
    //       { id: 'comments', title: 'comments' },
    //       { id: 'views', title: 'views' },
    //     ],
    //     append: true
    //   });
    //   csvWriter.writeRecords(readStream.deleted)
    //     .then(() => {
    //       readStream.deleted = []
    //       resolve(readStream)
    //     });
    // })
    const exportPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'posts_info.json')
    return {
      FileName: 'posts_info.json',
      Path: exportPath,
      ContentType: mime.lookup(exportPath),
      ContentLength: statSync(exportPath).size,
      Body: readFileSync(exportPath),
    }
  }

  return { execute }
}
