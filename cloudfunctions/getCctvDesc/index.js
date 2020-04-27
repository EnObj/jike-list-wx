// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require('http')
const cheerio = require('cheerio')

const codeMap = {
  'cctvamerica': 'cctv4america',
  'cctvjilu': 'cctv9',
  'cctv4': 'cctv4asia',
  'cctveurope': 'cctv4europe',
  'cctvchild': 'cctv14'
}

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'jike-v2-hnr1l'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  return loadAllChannels([]).then(channels => {
    const promises = channels.map(channel => {
      const realCode = codeMap[channel.code] || channel.code
      return request(`http://tv.cctv.com/${realCode}/`).then(body => {
        // console.log(body)
        const $ = cheerio.load(body)
        return new Promise((resolve, reject) => {
          $('p.p_1').each((index, item) => {
            const desc = $(item).text()
            return db.collection('channel').doc(channel._id).update({
              data: {
                desc: desc
              }
            }).then(res => {
              resolve({
                channel: channel.code,
                desc: desc
              })
            })
          })
        })
      })
    })
    return Promise.all(promises)
  })
}

const request = function(url) {
  return new Promise((resolve, reject) => {
    http.get(url, function(res) {
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