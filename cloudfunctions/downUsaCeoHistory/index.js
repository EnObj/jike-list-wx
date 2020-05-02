// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'jike-mr6e0'
})

// 云函数入口函数
exports.main = async(event, context) => {
  return downByTh(41)
}

const downByTh = function(th) {
  console.log(`${th} is doing...`)
  return cloud.callFunction({
    name: 'loadProgramListFromWeb',
    data: {
      date: th,
      channelCode: 'usa-ceo'
    }
  }).then(res => {
    console.log(res)
    if (--th > 0) {
      return downByTh(th)
    }
    return Promise.resolve(th)
  })
}