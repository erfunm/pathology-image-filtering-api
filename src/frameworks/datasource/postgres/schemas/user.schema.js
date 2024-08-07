module.exports = ({ DataTypes }) => {
  const sync = async function (model, forcedOpts) {
    const opts = {
      force: forcedOpts?.force || false,
      alter: forcedOpts?.alter || false
    }
    return await model.sync(opts)
  }

  const execute = function (sequelize) {
    const modelSettings = {
      modelName: 'users',
      timestamps: true,
      freezeTableName: false,
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    }

    const fieldDefinitions = {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        allowNull: false
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }

    return sequelize.define(
      modelSettings.modelName,
      fieldDefinitions,
      modelSettings
    )
  }

  const createRelations = function (model, { userrates, assignments }) {
    // model.hasMany([MODEL], { foreignKey: '[KEY]' })
  }

  return { execute, createRelations, sync }
}
