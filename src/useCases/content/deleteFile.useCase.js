const { ResponseError } = require('../../frameworks/common')

const path = require('path')
const { statSync, renameSync, createReadStream } = require('fs')
const mime = require('mime-types')
const CSVParser = require('csv-parser')
const CSVWriter = require('csv-writer')

module.exports = (dependecies) => {
  const {
    envConfig: { APP_CONTENT_PATH }
  } = dependecies

  const execute = ({ InstagramID, fileName }) => {
    const imagePath = path.resolve(APP_CONTENT_PATH, InstagramID, fileName)
    const deletedPath = path.resolve(APP_CONTENT_PATH, InstagramID, `.DELETED_${fileName}`)
    renameSync(imagePath, deletedPath)
    const csvData = {
      list: [],
      deleted: []
    }
    const csvPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'posts_info.csv')
    const csvDeletedPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'deleted_posts_info.csv')
    createReadStream(csvPath) // Replace with your actual file path
      .pipe(CSVParser())
      .on('data', (data) => {
        if (data.filename === fileName) {
          csvData.deleted.push({ ...data, postId: data[Object.keys(data)[0]] })
        } else {
          csvData.list.push({ ...data, postId: data[Object.keys(data)[0]] })
        }
      })
      .on('end', () => {
        // Write the new CSV file
        const csvWriter = CSVWriter.createObjectCsvWriter({
          path: csvDeletedPath,
          header: [
            { id: 'postId', title: 'post_id' },
            { id: 'filename', title: 'filename' },
            { id: 'description', title: 'description' },
            { id: 'likes', title: 'likes' },
            { id: 'comments', title: 'comments' },
            { id: 'views', title: 'views' },
          ],
          append: true
        });
        csvWriter.writeRecords(csvData.deleted)
          .then(() => {
            csvData.deleted = []
          });
        // Update the original CSV file
        const csvWriter2 = CSVWriter.createObjectCsvWriter({
          path: csvPath,
          header: [
            { id: 'postId', title: 'post_id' },
            { id: 'filename', title: 'filename' },
            { id: 'description', title: 'description' },
            { id: 'likes', title: 'likes' },
            { id: 'comments', title: 'comments' },
            { id: 'views', title: 'views' },
          ]
        });
        csvWriter2.writeRecords(csvData.list)
          .then(() => {
            csvData.list = []
          });
      });
    return {
      Path: deletedPath,
      ContentType: mime.lookup(deletedPath),
      ContentLength: statSync(deletedPath).size,
      Body: '',
    }

  }

  return { execute }
}
