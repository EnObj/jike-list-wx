// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'jike-v2-hnr1l'
})

const db = cloud.database()
const historyDb = cloud.database({
  env: 'jike-mr6e0'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const query = historyDb.collection('user_action').where({})
  return query.count().then(res => {
    console.log(res.total)
    return syncByPage(0, query)
  })
}

const syncByPage = (count, query) => {
  console.log(count)
  // text
  return query.orderBy('channel', 'asc').orderBy('programInsideId', 'asc').skip(count).limit(20).get().then(res => {
    const userActions = res.data
    const batch = userActions.length
    return sync(userActions).then(res => {
      if (batch == 20) {
        return syncByPage(count + batch, query)
      }
      return Promise.resolve()
    })
  })
}

const sync = userActions => {
  if (!userActions.length) {
    return Promise.resolve()
  }
  const userAction = userActions.pop()
  // console.log(userAction)
  if (userAction.programInsideId) {
    return db.collection('user_action').where({
      _openid: userAction._openid,
      channel: userAction.channel,
      programInsideId: userAction.programInsideId,
      date: userAction.date
    }).remove().then(res => {
      console.log(res)
      return db.collection('user_action').add({
        data: userAction
      }).then(res => {
        return sync(userActions)
      })
    })
  }
  return sync(userActions)
}