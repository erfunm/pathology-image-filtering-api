const { ResponseError } = require('../../frameworks/common')

const path = require('path')
const { statSync, unlinkSync, createReadStream, writeFileSync } = require('fs')
const mime = require('mime-types')
const CSVParser = require('csv-parser')
// const CSVWriter = require('csv-writer')

module.exports = (dependecies) => {
  const {
    envConfig: { APP_CONTENT_PATH }
  } = dependecies

  const execute = ({ InstagramID, fileName }) => {
    const imagePath = path.resolve(APP_CONTENT_PATH, InstagramID, fileName)
    // const deletedPath = path.resolve(APP_CONTENT_PATH, InstagramID, `.DELETED_${fileName}`)
    unlinkSync(imagePath)
    const csvData = {
      list: [],
      deleted: []
    }
    const csvPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'posts_info.csv')
    // const csvDeletedPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'deleted_posts_info.csv')
    createReadStream(csvPath) // Replace with your actual file path
      .pipe(CSVParser())
      .on('data', (data) => {
        if (data.filename !== fileName) {
          csvData.list.push({ ...data, postId: data[Object.keys(data)[0]] })
        }
      })
      .on('end', () => {
        const jsonPath = path.resolve(APP_CONTENT_PATH, InstagramID, 'posts_info.json')
        writeFileSync(jsonPath, JSON.stringify(csvData.list, null, 2))
        // // Write the new CSV file
        // const csvWriter = CSVWriter.createObjectCsvWriter({
        //   path: csvDeletedPath,
        //   header: [
        //     { id: 'postId', title: 'post_id' },
        //     { id: 'filename', title: 'filename' },
        //     { id: 'description', title: 'description' },
        //     { id: 'likes', title: 'likes' },
        //     { id: 'comments', title: 'comments' },
        //     { id: 'views', title: 'views' },
        //   ],
        //   append: true
        // });
        // csvWriter.writeRecords(csvData.deleted)
        //   .then(() => {
        //     csvData.deleted = []
        //   });
        // // Update the original CSV file
        // const csvWriter2 = CSVWriter.createObjectCsvWriter({
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
        // csvWriter2.writeRecords(csvData.list)
        //   .then(() => {
        //     csvData.list = []
        //   });
      });
    return {
      Path: imagePath,
      ContentType: mime.lookup(imagePath),
      ContentLength: statSync(imagePath).size,
      Body: '',
    }

  }

  return { execute }
}
