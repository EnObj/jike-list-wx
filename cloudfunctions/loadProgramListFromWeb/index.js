// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require('http')
const https = require('https')
const cheerio = require('cheerio')

const nbeMap = {
  'nbe-wlx': 'physics',
  'nbe-hx': 'chemistry',
  'nbe-slx-yx': 'medicine',
  'nbe-wx': 'literature',
  'nbe-hp': 'peace',
  'nbe-jjx': 'economic-sciences'
}

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
  // env: 'jike-v2-hnr1l'
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
          createTime: new Date()
        }
        // 人物列表：list
        const listPromises = $('#pjax-well > div:nth-child(1) > section.page-section.laureate-facts > article > div.list-laureates.border-top > figure').map((index, item) => {
          const imageUrl = $(item).find('source').first().attr('data-srcset')
          return request(imageUrl, 'binary').then(imageData => {
            // 存储
            return cloud.uploadFile({
              fileContent: Buffer.from(imageData, 'binary'),
              cloudPath: imageUrl.substr(imageUrl.lastIndexOf('/') + 1)
            }).then(res=>{
              return {
                title: $(item).find('h3').text().trim(),
                image: res.fileID,
                remarks: [$(item).find('p').last().text().trim()],
                insideId: '' + index
              }
            })
          })
        }).get()
        return Promise.all(listPromises).then(list => {
          programList.list = list
          // return programList
          return db.collection('program_list').add({
            data: programList
          }).then(res => {
            return programList
          })
        })
      })
    }
  })
}

const request = function(url, encoding) {
  console.log(url)
  const proc = url.startsWith('https') ? https : http
  return new Promise((resolve, reject) => {
    proc.get(url, function(res) {
      if (encoding){
        res.setEncoding(encoding)
      }
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