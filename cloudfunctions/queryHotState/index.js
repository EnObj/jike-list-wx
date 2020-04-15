// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async(event, context) => {
  const {
    channel,
    date
  } = event

  return db.collection('user_action').aggregate()
    .match({
      channel,
      date
    })
    .group({
      _id: '$programInsideId',
      num: $.sum(1)
    })
    .end()
}