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
  const query = historyDb.collection('program_list').where({
    channelCode: 'turing'
  })
  return query.count().then(res => {
    console.log(res.total)
    return syncByPage(0, query)
  })
}

const syncByPage = (count, query) => {
  console.log(count)
  // text
  return query.orderBy('createTime', 'asc').skip(count).limit(20).get().then(res => {
    const list = res.data
    const batch = list.length
    return sync(list).then(res => {
      if (batch == 20) {
        return syncByPage(count + batch, query)
      }
      return Promise.resolve()
    })
  })
}

const sync = list => {
  if (!list.length) {
    return Promise.resolve()
  }
  const program = list.pop()
  return db.collection('program_list').where({
    channelCode: program.channelCode,
    dateType: program.dateType,
    date: program.date
  }).remove().then(res => {
    console.log(res)
    return db.collection('program_list').add({
      data: program
    }).then(res => {
      return sync(list)
    })
  })
}