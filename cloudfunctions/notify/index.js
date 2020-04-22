// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  var secondTime = Math.floor(Date.now() / 1000)

  var sendResults = []

  var limit = 20
  var batch = 0
  var count = 0
  do {
    var results = await batchProcess(count, limit, secondTime)
    sendResults = sendResults.concat(results)
    batch = results.length
    count += batch
  } while (batch == limit);

  return sendResults;
}

const batchProcess = (skip, limit, secondTime) => {
  return db.collection('user_action').where({
    needNotify: true,
    'notify.status': 'wait',
    'program.startTime': db.command.lte(secondTime + 15 * 60)
  }).skip(skip).limit(limit).get().then(res => {
    var userActions = res.data
    return Promise.all(userActions.map(action => {
      return notify(action)
    })).then(sendRes => {
      // 修改通知状态
      return db.collection('user_action').where({
        _id: db.command.in(userActions.map(action => {
          return action._id
        }))
      }).update({
        data: {
          'notify.status': 'finished'
        }
      }).then(res => {
        return sendRes
      })
    })
  })
}

const notify = async(userAction) => {
  try {
    var program = userAction.program
    const result = await cloud.openapi.subscribeMessage.send({
      touser: userAction._openid,
      page: '/pages/index?channel=' + userAction.channel + '&date=' + userAction.date,
      data: displayProgram(program),
      templateId: 'PeNNc-AQ5M2ZLE6BniC5YJwCcVAd1UVlsq7dZEz1n0w'
    })
    console.log(result)
    return {
      action: userAction._id,
      result: result
    }
  } catch (err) {
    console.log(err)
    return {
      action: userAction._id,
      err: err
    }
  }
}

const displayProgram = program => {
  return {
    thing2: {
      value: program.title.substr(0, 20)
    },
    date3: {
      value: formatDate(new Date(program.startTime * 1000))
    },
    date4: {
      value: formatDate(new Date(program.endTime * 1000))
    },
    thing1: {
      value: '时长' + Math.ceil(program.length / 60) + '分钟'
    }
  }
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()

  return '' + year + '年' + formatNumber(month) + '月' + formatNumber(day) + '日 ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}