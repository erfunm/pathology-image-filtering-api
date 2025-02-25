const { ResponseError } = require('../../frameworks/common')

const path = require('path')
const {
  readdir,
  readdirSync,
  existsSync,
  readFileSync,
  writeFile,
  statSync,
  createReadStream,
  createWriteStream,
  unlink,
  mkdirSync,
  copyFileSync
} = require('fs')
const CSVParser = require('csv-parser')
const CSVWriter = require('csv-writer')

module.exports = (dependecies) => {
  const {
    envConfig: {
      APP_CONTENT_PATH,
      APP_JSON_START,
      APP_JSON_END,
      APP_JSON_CAP,
      APP_CHATGPT_BATCH_SIZE,
      APP_CHATGPT_MODEL,
      APP_CHATGPT_TEMPERATURE,
      APP_CHATGPT_MAX_TOKENS
    }
  } = dependecies

  const execute = async () => {
    const contentPath = path.resolve(APP_CONTENT_PATH)
    return await new Promise((resolve, reject) => {
      readdir(contentPath, async (err, files) => {
        if (err) {
          reject(new ResponseError(err.message, 500))
        }
        if (typeof files === 'undefined') {
          reject(new ResponseError('No content found', 404))
        }
        let totalPosts = 0
        const posts = []
        const duplicates = []
        const seen = new Set()
        const profiles = files
          .filter(file => statSync(path.resolve(contentPath, file)).isDirectory())
          .map(file => {
            const jsonPath = path.resolve(contentPath, file, 'posts_info.json')
            let jsonData = existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath)) : []
            if (jsonData.length) {
              jsonData = jsonData.map(post => {
                if (seen.has(post.custom_id)) {
                  duplicates.push(post.custom_id)
                  return null
                }
                seen.add(post.custom_id)
                // post.profile = file
                return post
              }).filter(itm => itm !== null)
            }
            totalPosts += jsonData.length
            posts.push(...jsonData)
            return {
              id: file,
              jsonData,
            }
          })
        // const BatchesToGenerate = new Array(Math.ceil(totalPosts / APP_CHATGPT_BATCH_SIZE)).fill(null)
        //   .map((_, idx) => {
        //     const start = idx * APP_CHATGPT_BATCH_SIZE
        //     let end = (idx + 1) * APP_CHATGPT_BATCH_SIZE
        //     end = end > totalPosts ? totalPosts : end
        //     const queries = []
        //     const queryObj = {
        //       'custom_id': null,
        //       'method': 'POST',
        //       'url': '/v1/chat/completions',
        //       'body': {
        //         'model': APP_CHATGPT_MODEL,
        //         'messages': [{
        //           'role': 'system',
        //           'content': 'You are a helpful pathologist.'
        //         }, {
        //           'role': 'user',
        //           'content': ''
        //         }],
        //         'max_tokens': APP_CHATGPT_MAX_TOKENS,
        //         'temperature': APP_CHATGPT_TEMPERATURE
        //       }
        //     }
        //     posts.slice(start, end).forEach(post => {
        //       const newQuery = { ...queryObj }
        //       newQuery.custom_id = post.filename
        //       newQuery.body.messages[1].content = `Rephrase or shorten the following pathology image description. Delete any non-English words or phrases. Do not include hashtags if they are not part of description.Replace single words like 'vocal cords' with more descriptive phrases, such as 'a histopathology image of the vocal cords.'  Remove any questions or irrelevant details, and keep the most informative text only. Do not add any new information. Ensure that the response completes the thought within ${APP_CHATGPT_MAX_TOKENS} tokens, and avoids cutting off mid-sentence. Here is the description: '${post.description}}' `
        //       queries.push(newQuery)
        //     })
        //     return queries
        //   })
        // BatchesToGenerate.forEach((file, idx) => {
        //   const jsonPath = path.resolve(APP_CONTENT_PATH, `batch_queries_${idx}.json`)
        //   writeFile(jsonPath, JSON.stringify(file, null, 2), (err) => {
        //     if (err) {
        //       console.error('Error writing batch queries to JSON file', err)
        //     }
        //     console.log('The JSON file was written successfully: %s', jsonPath)
        //   })
        // })
        const filesToGenerate = new Array(Math.ceil(totalPosts / APP_JSON_CAP)).fill(null)
          .map((_, idx) => {
            const start = idx * APP_JSON_CAP
            if (APP_JSON_START > start) return
            let end = (idx + 1) * APP_JSON_CAP
            end = end > totalPosts ? totalPosts : end
            if (APP_JSON_END && APP_JSON_END < end) return
            const total = end - start
            // console.log({ start, end, total })
            return posts.slice(start, end)
            // return {
            //   start,
            //   end,
            //   total,
            //   posts: posts.slice(start, end),
            // }
          })
        filesToGenerate.forEach((file, idx) => {
          const jsonPath = path.resolve(APP_CONTENT_PATH, `posts_info_${idx}.jsonl`)
          writeFile(jsonPath, JSON.stringify(file), (err) => {
            if (err) {
              console.error('Error writing batch queries to JSON file', err)
            }
            console.log('The JSON file was written successfully: %s', jsonPath)
          })
        })
        // filesToGenerate.forEach((file, idx) => {
        //   if (!file) return
        //   const csvPath = path.resolve(APP_CONTENT_PATH, `posts_info_${idx}.csv`)
        //   const writer = CSVWriter.createObjectCsvWriter({
        //     path: csvPath,
        //     header: [
        //       { id: 'profile', title: 'profile' },
        //       { id: 'postId', title: 'post_id' },
        //       { id: 'filename', title: 'filename' },
        //       { id: 'description', title: 'description' },
        //       { id: 'likes', title: 'likes' },
        //       { id: 'comments', title: 'comments' },
        //       { id: 'views', title: 'views' },
        //     ]
        //   })
        //   writer.writeRecords(file.posts)
        //     .then(() => {
        //       console.log('The CSV file was written successfully: %s', csvPath)
        //     })
        // })
        resolve({
          total: {
            profiles: profiles.length,
            posts: totalPosts,
            files: filesToGenerate.length
          },
          duplicates
        })
      })
    })
  }

  const GPTResultToCSV = async () => {
    const gptResultPath = path.resolve(APP_CONTENT_PATH, 'gpt_result.txt')
    const csvPath = path.resolve(APP_CONTENT_PATH, 'gpt_result.csv')

    const csvData = []
    readFileSync(gptResultPath, 'utf8').split('\n').forEach(itm => {
      if (!String(itm).trim().length) return
      const {
        custom_id: filename,
        response,
      } = JSON.parse(itm)
      const description = response?.body?.choices[0]?.message?.content ?? ''
      csvData.push({
        filename,
        description: description.replace(/\#(\w+)/gim, '')
      })
    })
    // write it to a CSV file
    const writer = CSVWriter.createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'filename', title: 'filename' },
        { id: 'description', title: 'description' }
      ]
    })
    writer.writeRecords(csvData)
      .then(() => {
        console.log('The CSV file was written successfully: %s', csvPath)
      })
    return csvData
  }

  const dirItr = (dirList) => {
    let itr = 0
    let totalFiles = 0
    const validExts = ['jpg', 'png', 'webp', 'heic']
    const duplicates = []
    const copied = []
    return {
      next: (idx = itr) => {
        if (idx >= dirList.length) {
          return { value: copied, done: true }
        }
        const dirPath = dirList[idx]
        readdirSync(dirPath)
          .forEach(itm => {
            const fileExt = itm.split('.').reverse()[0]
            if (!validExts.includes(fileExt)) return
            const oldPath = path.resolve(dirPath, itm)
            const newPath = path.resolve(APP_CONTENT_PATH, 'z_images', itm)
            const duplicated = existsSync(newPath)
            if (duplicated) {
              duplicates.push({ itm, dirPath })
            } else {
              totalFiles++
              copyFileSync(oldPath, newPath)
              copied.push(itm)
            }
          })

        itr++
        return { value: dirPath, done: false }
      }
    }
  }

  const MergedCSVCleaner = async () => {
    // for clean path if not exists is csv file
    const csvPath = path.resolve(APP_CONTENT_PATH, 'merged_output.csv')
    if (!existsSync(csvPath)) return
    const imageStoragePath = path.resolve(APP_CONTENT_PATH, 'z_images')
    if (!existsSync(imageStoragePath)) {
      mkdirSync(imageStoragePath, { recursive: true })
    }

    const dirList = readdirSync(path.resolve(APP_CONTENT_PATH))
      .filter(itm => statSync(path.resolve(APP_CONTENT_PATH, itm)).isDirectory())
      .filter(itm => itm !== 'z_images')
      .map(itm => path.resolve(APP_CONTENT_PATH, itm))

    console.log('Directories to process: %s', dirList.length)

    const fileCopier = dirItr(dirList)
    let copier = fileCopier.next()
    while (!copier.done) {
      copier = fileCopier.next()
    }
    const copiedFiles = copier.value
    console.log('total files copied:', copiedFiles.length)

    const fileNames = []
    const toDelete = []
    createReadStream(csvPath)
      .pipe(CSVParser())
      .on('data', (data) => {
        const existed = existsSync(path.resolve(APP_CONTENT_PATH, 'z_images', data.custom_id))
        if (existed) {
          fileNames.push(data)
        }
      })
      .on('end', () => {
        console.log('CSV file successfully processed')
        console.log('Total records: %s', fileNames.length)

        const existedCsvPath = path.resolve(APP_CONTENT_PATH, `existed.csv`)
        const writer = CSVWriter.createObjectCsvWriter({
          path: existedCsvPath,
          header: [
            { id: 'custom_id', title: 'custom_id' },
            { id: 'content', title: 'content' }
          ]
        })
        writer.writeRecords(fileNames)
          .then(() => {
            console.log('The CSV file was written successfully: %s', existedCsvPath)
          })

        // DELETE FILES
        copiedFiles.forEach(fileName => {
          const shouldDelete = fileNames.findIndex(itm => itm.custom_id === fileName) === -1
          if (shouldDelete) {
            unlink(path.resolve(APP_CONTENT_PATH, 'z_images', fileName), () => { })
            toDelete.push({ custom_id: fileName })
            return false
          }
        })
        const deletedCsvPath = path.resolve(APP_CONTENT_PATH, `deleted.csv`)
        const writer2 = CSVWriter.createObjectCsvWriter({
          path: deletedCsvPath,
          header: [
            { id: 'custom_id', title: 'custom_id' }
          ]
        })
        writer2.writeRecords(fileNames)
          .then(() => {
            console.log('The CSV file was written successfully: %s', deletedCsvPath)
          })
        console.log('Files to delete: %s', toDelete.length)
      })

    return {}

  }

  return { execute, GPTResultToCSV, MergedCSVCleaner }
}
