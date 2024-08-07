const { Sequelize } = require('sequelize')

module.exports = class PostgresAdapter {
  constructor () {
    this.DB = null
    this.Op = Sequelize.Op
    this.events = null
    this.ConnPingFlag = false
  }

  Connect(
    opts = {
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      network: process.env.DB_NETWORK
    }
  ) {
    let connstr = `postgres://${opts.user}:${opts.pass}@`
    connstr += opts.network || `${opts.host}:${opts.port}`
    connstr += `/${opts.name}`
    try {
      const DB = new Sequelize(connstr, {
        logging: false
      })
      DB.authenticate()
        .then(() => {
          if (this.ConnPingFlag) {
            DB.close()
            this.ConnPingFlag = false
            this.AdapterHook('dbpong')
          } else {
            this.DB = DB
            this.AdapterHook('connection')
          }
        })
        .catch((error) => {
          console.error('Unable to connect to the database:', error)
        })
    } catch (error) {
      console.error('Unable to connect to the database:', error)
    }
  }

  Disconnect() {
    this.DB?.close()
    this.AdapterHook('dbdisconnected')
  }

  ConnectionPing() {
    this.ConnPingFlag = true
    this.Connect()
  }

  GetModelHandler(modelName) {
    return this.DB.models[modelName.toLowerCase()]
  }

  ModelLoader(Models = Object.keys(this.Models)) {
    let index = 0
    return {
      next: () => {
        const ModelName = Models[index]
        // console.log('loading model: %s', ModelName)
        const Model = this.Models[ModelName].execute(this.DB)
        if (index < Models.length - 1) {
          index++
          return { done: false, value: Model }
        } else {
          return { done: true, value: Model }
        }
      }
    }
  }

  ModelRelationsCreator(Models = Object.keys(this.Models)) {
    let index = 0
    return {
      next: () => {
        const ModelName = Models[index]
        this.Models[ModelName].createRelations(
          this.GetModelHandler(ModelName),
          this.DB.models
        )
        if (index < Models.length - 1) {
          index++
          return { done: false }
        } else {
          return { done: true }
        }
      }
    }
  }

  ModelSync(Models = Object.keys(this.Models)) {
    let index = 0
    return {
      next: async (forcedOpts) => {
        const ModelName = Models[index]
        // console.log('syncing model: %s', ModelName)
        await this.Models[ModelName].sync(
          this.GetModelHandler(ModelName),
          forcedOpts
        )
        if (index < Models.length - 1) {
          index++
          return { done: false }
        } else {
          return { done: true }
        }
      }
    }
  }

  async Sync(force, alter) {
    try {
      // Load Models
      const Loader = this.ModelLoader()
      let loaded = Loader.next()
      while (true) {
        if (loaded.done) {
          console.log('> all models loaded!')
          break
        }
        loaded = Loader.next()
      }

      // Sync Models
      const Syncer = this.ModelSync()
      let synced = await Syncer.next({ force, alter })
      while (true) {
        if (synced.done) {
          console.log('> all models synced!')
          break
        }
        synced = await Syncer.next({ force, alter })
      }

      // Load Models
      const Relations = this.ModelRelationsCreator()
      let created = Relations.next()
      while (true) {
        if (created.done) {
          console.log('> all models relations created!')
          break
        }
        created = Relations.next()
      }
      // console.log('synincing db...', { force, alter })
      // this.DB?.sync({ force, alter })
    } catch (Exception) {
      console.log({ Exception })
      throw Exception
    }
  }

  Drop() {
    this.DB.drop()
    this.AdapterHook('dropped')
  }

  GetModel(modelName, single = false) {
    const model = this.GetModelHandler(modelName)
    if (!model || typeof model === 'undefined') {
      return new Error(`model ${modelName} is not defined.`)
    }
    if (single) {
      return model
    }
    return this.Queries(model)
  }

  DropModel(modelName) {
    this.GetModelHandler(modelName).drop()
  }

  Queries(model) {
    return Object.freeze({
      Find: (queryData, opts, successCb) =>
        this.QFind(model, queryData, opts, successCb),
      FindOne: (queryData, opts = {}) => this.QFindOne(model, queryData, opts),
      FindById: (id, opts = {}) => this.QFindById(model, id, opts),
      FindOrCreate: (queryData) => this.QFindOrCreate(model, queryData),
      FindWithRel: (queryData, successCb) =>
        this.QFindWithRel(model, queryData, successCb),
      FindOneWithRel: (queryData) => this.QFindOneWithRel(model, queryData),
      Search: (queryData, opts) => this.QSearch(model, queryData, opts),
      Create: (queryData) => this.QCreate(model, queryData),
      Update: (queryData) => this.QUpdate(model, queryData),
      Delete: (queryData) => this.QDelete(model, queryData),
      Count: (queryData, opts) => this.QCount(model, queryData, opts),
      Truncate: () => this.QTruncate(model)
    })
  }

  async QFind(model, queryData = {}, opts = {}, successCb = null) {
    const query = opts
    query.where = queryData
    if (typeof successCb === 'function') {
      return await model.findAll(query).then(successCb)
    }
    return await model.findAll(query)
  }

  async QFindOne(model, queryData = {}, opts = {}) {
    const query = opts
    query.where = queryData
    return await model.findOne(query)
  }

  async QFindById(model, id) {
    return await model.findOne({
      where: { id }
    })
  }

  async QFindOrCreate(model, queryData = {}) {
    return await model.findOrCreate({
      where: queryData
    })
  }

  async QFindWithRel(
    model,
    { where, order, hasPager = false, page = 1, limit = 25, rels },
    successCb = null
  ) {
    let include = []
    if (rels instanceof Array) {
      include = rels
    } else {
      for (const rel in rels) {
        const modelObj = this.GetModel(rel, true)
        const modelVals = rels[rel] instanceof Array ? rels[rel] : [rels[rel]]
        modelVals.forEach((modelVal) => {
          const relObject = {
            model: modelObj,
            as: modelVal?.as ?? null,
            where: modelVal?.cond ?? {},
            order: modelVal?.sort ?? [['id', 'ASC']],
            required: false
          }
          if (modelVal?.rels) {
            relObject.include = []
            for (const rel2 in modelVal?.rels) {
              const modelObj2 = this.GetModel(rel2, true)
              const modelVal2 = modelVal?.rels[rel2]
              const relObject2 = {
                model: modelObj2,
                as: modelVal2?.as ?? null,
                where: modelVal2?.cond ?? {},
                order: modelVal2?.sort ?? [['id', 'ASC']],
                required: false
              }
              relObject.include.push(relObject2)
            }
          }
          include.push(relObject)
          switch (modelVal?.type) {
            case 'belongsTo':
              model.belongsTo(modelObj, { foreignKey: modelVal?.fKey })
              break
            case 'hasMany':
              model.hasMany(modelObj, { foreignKey: modelVal?.fKey })
              break
            case 'hasOne':
              model.hasMany(modelObj, { foreignKey: modelVal?.fKey })
              break
          }
        })
      }
    }
    const query = {
      where,
      include
    }
    if (hasPager) {
      query.skip = (page - 1) * limit
      query.limit = limit
    }
    if (order && order.length) {
      query.order = [order]
    }
    if (typeof successCb === 'function') {
      return await model.findAll(query).then(successCb)
    }
    return await model.findAll(query)
  }

  async QFindOneWithRel(model, { where, attributes = ['id', 'email'], rels }) {
    const include = []
    for (const rel in rels) {
      const modelObj = this.GetModel(rel, true)
      const modelVal = rels[rel]
      const relObject = {
        model: modelObj,
        as: modelVal?.as,
        where: modelVal?.cond ?? {}
      }
      if (modelVal?.attributes ?? null) {
        relObject.attributes = modelVal?.attributes
      }
      include.push(relObject)
      switch (modelVal?.type) {
        case 'hasMany':
          model.hasMany(modelObj, { foreignKey: modelVal?.fKey ?? 'id' })
          break
        case 'hasOne':
          model.hasOne(modelObj, { foreignKey: modelVal?.fKey ?? 'id' })
          break
        default:
          model.belongsTo(modelObj, { foreignKey: modelVal?.fKey ?? 'id' })
      }
    }
    return await model.findOne({
      where,
      attributes,
      include
    })
  }

  async QSearch(model, queryData = {}, opts = {}) {
    const query = opts
    query.where = {
      [this.Op.or]: {}
    }
    for (const key in queryData) {
      const keyObj = {}
      keyObj[key] = {
        [this.Op.iLike]: `%${queryData[key]}%`
      }
      query.where[this.Op.or] = Object.assign(
        {},
        query.where[this.Op.or],
        keyObj
      )
    }
    return await model.findOne(query)
  }

  async QCreate(model, queryData = {}) {
    // console.log('QCreate: %j', queryData)
    return await model.create(queryData)
  }

  async QUpdate(model, { cond = {}, data = {} }) {
    // console.log('QUpdate: %j', { cond, data })
    return await model.update(data, { where: cond })
  }

  async QDelete(model, queryData = {}) {
    return await model.destroy({ where: queryData })
  }

  async QCount(model, queryData = {}, opts = {}) {
    const query = opts
    query.where = queryData
    return await model.count(query)
  }

  async QTruncate(model) {
    return await model.truncate()
  }
}
