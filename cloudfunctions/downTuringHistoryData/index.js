// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'jike-mr6e0'
})

// 云函数入口函数
exports.main = async(event, context) => {
  return downByYear(2017)
}

const downByYear = function(year){
  console.log(`${year} is doing...`)
  return cloud.callFunction({
    name: 'loadProgramListFromWeb',
    data: {
      date: year,
      channelCode: 'turing'
    }
  }).then(res=>{
    console.log(res)
    if(++year < 2020){
      return downByYear(year)
    }
    return Promise.resolve(year)
  })
}