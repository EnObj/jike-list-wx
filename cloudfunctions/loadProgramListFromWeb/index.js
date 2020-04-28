// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require('http')
const https = require('https')
const cheerio = require('cheerio')

const nbeMap = {
  'nbe-wx': 'literature'
}

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'jike-v2-hnr1l'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()

  var channelCode = event.channelCode
  var date = event.date

  return db.collection('channel').where({
    code: channelCode
  }).get().then(res => {
    const channel = res.data[0]
    if (!channel) {
      console.error(`频道${channelCode}不存在`)
      return
    }
    if (channel.type == 'cctv') {
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
              date: date,
              dateType: channel.dateType,
              list: cctvItem.list.map(program => {
                program.insideId = '' + program.startTime
                return program
              })
            }
            db.collection('program_list').add({
              data: programList
            }).then(res => {
              resolve(programList)
            })
          })
        })
      })
    } else if (channel.type == 'nbe') {
      return request(`https://www.nobelprize.org/prizes/${nbeMap[channel.code]}/${date}/summary/`).then(html => {
        const $ = cheerio.load(html)
        // 描述
        const desc = $('#pjax-well > div:nth-child(1) > section.page-section.laureate-facts > article > blockquote').text().trim()
        if (!desc) {
          console.log('nothing founded')
          return
        }
        const programList = {
          channelCode,
          date,
          dateType: channel.dateType,
          desc: desc,
          list: [],
          createTime: new Date()
        }
        // 人物列表：list
        $('#pjax-well > div:nth-child(1) > section.page-section.laureate-facts > article > div.list-laureates.border-top > figure').each((index, item) => {
          programList.list.push({
            title: $(item).find('h3').text().trim(),
            remarks: [$(item).find('p').last().text().trim()]
          })
        })
        return db.collection('program_list').add({
          data: programList
        }).then(res => {
          return programList
        })
      })
    }
  })

}

const request = function(url) {
  const proc = url.startsWith('https') ? https : http
  return new Promise((resolve, reject) => {
    proc.get(url, function(res) {
      var str = "";
      res.on("data", function(chunk) {
        str += chunk; //监听数据响应，拼接数据片段
      })
      res.on("end", function() {
        resolve(str)
      })
    })
  })
}