// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require('http');

cloud.init({
  env: 'jike-v2-hnr1l'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  var week = initDateList()
  var promises = []
  return loadAllChannels([]).then(channels => {
    channels.forEach(channel => {
      week.dateList.forEach(date => {
        console.log('正在处理：' + channel.code + ' ' + date.int8Date)
        var promise = syncProgrtams(channel.code, date.int8Date)
        promises.push(promise)
      })
    })
    return Promise.all(promises)
  })
}

const syncProgrtams = function (channel, date) {
  const channelCode = channel.code
  return new Promise((resolve, reject) => {
    http.get("http://api.cntv.cn/epg/getEpgInfoByChannelNew?c=" + channelCode + "&serviceId=tvcctv&d=" + date, function(data) {
      var str = "";
      data.on("data", function(chunk) {
        str += chunk; //监听数据响应，拼接数据片段
      })
      data.on("end", function() {
        var res = JSON.parse(str);
        var cctvItem = res.data[channelCode]
        var programList = {
          channelCode: channelCode,
          date: ''+date,
          dateType: channel.dateType
        }
        db.collection('program_list').where(programList).remove().then(res => {
          programList.list = cctvItem.list.map(program => {
            program.insideId = '' + program.startTime
            program.seo = program.title
            return program
          })
          db.collection('program_list').add({
            data: programList
          }).then(res => {
            resolve(programList)
          }, reject)
        }, reject)
      })
    })
  })
}

const loadAllChannels = function(channels) {
  var limit = 20
  return db.collection('channel').where({
    type: 'cctv'
  }).skip(channels.length).limit(limit).get().then(res => {
    channels = channels.concat(res.data)
    if (res.data.length == limit) {
      return loadAllChannels(channels);
    }
    return channels
  })
}

const initDateList = function(locDay) {
  var locDay = locDay || new Date()
  var dateList = []
  var currentDate = {}
  for (var i = -6; i < 7; i++) {
    var pDate = new Date(locDay.getTime())
    pDate.setDate(pDate.getDate() + i)
    var dayObj = getDateObj(pDate)
    dateList.push(dayObj)
    // 今天
    if (i == 0) {
      currentDate = dayObj
    }
  }
  return {
    dateList: dateList.splice((7 - currentDate.week) % 7, 7),
    currentDate: currentDate
  }
}

const getDateObj = function(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var week = date.getDay()
  return {
    year: year,
    month: month,
    day: day,
    week: week,
    int8Date: year * 10000 + month * 100 + day,
    showWeek: ['日', '一', '二', '三', '四', '五', '六'][week],
    showDate: year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day),
    time: date.getTime()
  };
}