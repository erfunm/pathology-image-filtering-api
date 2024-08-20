const { ResponseError } = require('../../frameworks/common')

const path = require('path')
const { readdir, existsSync, readFileSync, writeFile, statSync } = require('fs')
const CSVWriter = require('csv-writer')

module.exports = (dependecies) => {
  const {
    envConfig: {
      APP_CONTENT_PATH,
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
        const profiles = files
          .filter(file => statSync(path.resolve(contentPath, file)).isDirectory())
          .map(file => {
            const jsonPath = path.resolve(contentPath, file, 'posts_info.json')
            let jsonData = existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath)) : []
            if (jsonData.length) {
              jsonData = jsonData.map(post => {
                post.profile = file
                return post
              })
            }
            totalPosts += jsonData.length
            posts.push(...jsonData)
            return {
              id: file,
              jsonData,
            }
          })
        const BatchesToGenerate = new Array(Math.ceil(totalPosts / APP_CHATGPT_BATCH_SIZE)).fill(null)
          .map((_, idx) => {
            const start = idx * APP_CHATGPT_BATCH_SIZE
            let end = (idx + 1) * APP_CHATGPT_BATCH_SIZE
            end = end > totalPosts ? totalPosts : end
            const queries = []
            const queryObj = {
              'custom_id': null,
              'method': 'POST',
              'url': '/v1/chat/completions',
              'body': {
                'model': APP_CHATGPT_MODEL,
                'messages': [{
                  'role': 'system',
                  'content': 'You are a helpful pathologist.'
                }, {
                  'role': 'user',
                  'content': ''
                }],
                'max_tokens': APP_CHATGPT_MAX_TOKENS,
                'temperature': APP_CHATGPT_TEMPERATURE
              }
            }
            posts.slice(start, end).forEach(post => {
              const newQuery = { ...queryObj }
              newQuery.custom_id = post.filename
              newQuery.body.messages[1].content = `Rephrase or shorten the following pathology image description. Delete any non-English words or phrases. Do not include hashtags if they are not part of description.Replace single words like 'vocal cords' with more descriptive phrases, such as 'a histopathology image of the vocal cords.'  Remove any questions or irrelevant details, and keep the most informative text only. Do not add any new information. Ensure that the response completes the thought within ${APP_CHATGPT_MAX_TOKENS} tokens, and avoids cutting off mid-sentence. Here is the description: '${post.description}}' `
              queries.push(newQuery)
            })
            return queries
          })
        BatchesToGenerate.forEach((file, idx) => {
          const jsonPath = path.resolve(APP_CONTENT_PATH, `batch_queries_${idx}.json`)
          writeFile(jsonPath, JSON.stringify(file, null, 2), (err) => {
            if (err) {
              console.error('Error writing batch queries to JSON file', err)
            }
            console.log('The JSON file was written successfully: %s', jsonPath)
          })
        })
        const filesToGenerate = new Array(Math.ceil(totalPosts / APP_JSON_CAP)).fill(null)
          .map((_, idx) => {
            const start = idx * APP_JSON_CAP
            let end = (idx + 1) * APP_JSON_CAP
            end = end > totalPosts ? totalPosts : end
            const total = end - start
            return {
              start,
              end,
              total,
              posts: posts.slice(start, end)
            }
          })
        filesToGenerate.forEach((file, idx) => {
          const csvPath = path.resolve(APP_CONTENT_PATH, `posts_info_${idx}.csv`)
          const writer = CSVWriter.createObjectCsvWriter({
            path: csvPath,
            header: [
              { id: 'profile', title: 'profile' },
              { id: 'postId', title: 'post_id' },
              { id: 'filename', title: 'filename' },
              { id: 'description', title: 'description' },
              { id: 'likes', title: 'likes' },
              { id: 'comments', title: 'comments' },
              { id: 'views', title: 'views' },
            ]
          })
          writer.writeRecords(file.posts)
            .then(() => {
              console.log('The CSV file was written successfully: %s', csvPath)
            })
        })
        resolve({
          total: {
            profiles: profiles.length,
            posts: totalPosts,
            files: filesToGenerate.length
          }
        })
      })
    })
  }

  return { execute }
}
