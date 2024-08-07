module.exports = (Db) => {

  const getUser = async (cond = {}, isAdmin = false) => {
    if (!isAdmin) {
      cond['settings.active'] = true
    }
    return await Db.getUser(cond)
  }

  return Object.freeze({
    getUser
  })
}
