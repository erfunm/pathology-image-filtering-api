const { format: dateFormat } = require('date-fns')

module.exports = class User {
  constructor ({
    fullName,
    email
  }) {
    this.fullName = fullName
    this.email = email
  }

  DTO(itm = {}) {
    itm = itm?.dataValues ?? itm
    return User.DTO(Object.assign({}, this, itm))
  }

  static DTO(itm = {}) {
    return {
      uid: itm.uid,
      fullName: itm.fullName,
      email: itm.email.toLowerCase(),
      created: dateFormat(new Date(itm?.created ?? itm.createdAt), 'yyyy-MM-dd')
    }
  }

  static DTOs(list = []) {
    return list.map((itm) => User.DTO(itm))
  }

  static get Defaults() {
    return {}
  }

}
