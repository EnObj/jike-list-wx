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
exports.main = async(event, context) => {
  const query = historyDb.collection('program_list').where({})
  return query.count().then(res => {
    console.log(res.total)
    return syncByPage(0, query)
  })
}

const syncByPage = (count, query) => {
  // text
  console.log(count)
  return query.orderBy('channelCode', 'asc').orderBy('date', 'asc').skip(count).limit(50).get().then(res => {
    const programLists = res.data
    const batch = programLists.length
    return sync(programLists).then(res => {
      if (batch == 50) {
        return syncByPage(count + batch, query)
      }
      return Promise.resolve()
    })
  })
}

const sync = programLists => {
  if (!programLists.length) {
    return Promise.resolve()
  }
  const programList = programLists.pop()
  console.log(programList)
  if (programList.list && programList.list.length > 0) {
    programList.dateType = 'day'
    programList.list.forEach(program => {
      program.insideId = `${program.startTime}-${program.title}`
    })
    console.log(programList)
    return db.collection('program_list').where({
      channelCode: programList.channelCode,
      dateType: 'day',
      date: programList.date
    }).remove().then(res => {
      return db.collection('program_list').add({
        data: programList
      }).then(res => {
        return sync(programLists)
      })
    })
  }
  return sync(programLists)
}