// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'jike-v2-hnr1l'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  return db.collection('channel').where({
    type: 'nbe'
  }).get().then(res => {
    const channels = res.data
    const list = channels.flatMap(channel => {
      const channelYears = []
      for (var year = 1901; year < 2020; year++) {
        channelYears.push({
          channelCode: channel.code,
          date: year
        })
      } 
      return channelYears
    })
    console.log(`size: ${list.length}`)
    return resolveAllOneByOne(list.slice(0, 44))
  })
}

const resolveAllOneByOne = function(list){
  const target = list.pop()
  console.log(`start: ${list.length} - ${target.channelCode} - ${target.date}`)
  return cloud.callFunction({
    name: 'loadProgramListFromWeb',
    data: target
  }).then(res=>{
    console.log(res)
    if (list.length){
      return resolveAllOneByOne(list)
    }
  })
}