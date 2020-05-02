// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require('http')
const https = require('https')
const cheerio = require('cheerio')
const zlib = require('zlib')
const url = require('url')
const iconv = require('iconv-lite')

const nbeMap = {
  'nbe-wlx': 'physics',
  'nbe-hx': 'chemistry',
  'nbe-slx-yx': 'medicine',
  'nbe-wx': 'literature',
  'nbe-hp': 'peace',
  'nbe-jjx': 'economic-sciences'
}

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  // env: 'jike-v2-hnr1l'
  env: 'jike-mr6e0'
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
            }).then(res => {
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
    } else if (channel.type == 'turing') {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-cn',
          'Connection': 'keep-alive',
          'Accept-Encoding': 'gzip, deflate, br',
          'Host': 'amturing.acm.org'
        },
        gzip: true
      }
      const turingUrl = 'https://amturing.acm.org/byyear.cfm'
      return request(turingUrl, 'binary', options, unGzip).then(html => {
        return new Promise((resolve, reject) => {
          const $ = cheerio.load(html)
          $('#content > div > ul > li').each((index, item) => {
            const year = $(item).find('span').text()
            if (year.indexOf(date) >= 0) {
              const programList = {
                channelCode,
                date,
                dateType: channel.dateType,
                createTime: new Date()
              }
              // 拿到列表
              const listPromise = $(item).find('a').map((index, item) => {
                const programUrl = url.resolve(turingUrl, $(item).attr('href'))
                return request(programUrl, 'binary', options, unGzip).then(html => {
                  const $ = cheerio.load(html)
                  programList.desc = $('#content > div > div.col.col2 > div.citation > p').text()
                  const imageUrl = $('#content > div > div.col.col1 > div > a > img').attr('src')
                  return downImage(url.resolve(programUrl, imageUrl), options).then(res => {
                    return {
                      title: $(item).text(),
                      image: res.fileID
                    }
                  })
                })
              }).get()
              Promise.all(listPromise).then(list => {
                programList.list = list
                return db.collection('program_list').add({
                  data: programList
                }).then(res => {
                  resolve(programList)
                })
              })
              return false
            }
          })
        })
      })
    } else if (channel.type == 'ceo') {
      if (channel.code == 'usa-ceo') {
        return request('http://114.xixik.com/potus/#anchor3', 'binary', null, iconvDecode('GBK')).then(html => {
          return new Promise((resolve, reject) => {
            const $ = cheerio.load(html)
            $('body > div.body > div:nth-child(9) > div.custom_content > div > table > tbody > tr').each((index, item) => {
              const tds = $(item).find('td')
              if (+tds.first().text().trim() == date) {
                downImage(tds.eq(2).find('img').first().attr('src')).then(res => {
                  const programList = {
                    channelCode,
                    date,
                    dateType: channel.dateType,
                    createTime: new Date(),
                    desc: tds.eq(5).text().trim(),
                    list: [{
                      title: tds.eq(3).text().trim(),
                      image: res.fileID,
                      remarks: [tds.eq(1).text().trim(), tds.eq(4).text().trim()]
                    }]
                  }
                  db.collection('program_list').add({
                    data: programList
                  }).then(res => {
                    resolve(programList)
                  })
                  // resolve(programList)
                })
              }
            })
          })
        })
      }
    }
  })
}

// 本地地址：res.fileID
const downImage = function(imageUrl, options) {
  // 下载
  return request(imageUrl, 'binary', options).then(imageData => {
    // 存储
    return cloud.uploadFile({
      fileContent: Buffer.from(imageData, 'binary'),
      cloudPath: '' + Date.now() + '/' + imageUrl.substr(imageUrl.lastIndexOf('/') + 1)
    })
  })
}

const unGzip = function(gzipData) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(Buffer.from(gzipData, 'binary'), (err, result) => {
      resolve(result.toString())
    })
  })
}

const iconvDecode = function(type){
  return function (gzipData){
    return Promise.resolve(iconv.decode(Buffer.from(gzipData, 'binary'), type))
  }
}

const request = function(url, encoding, options = {}, pipe) {
  console.log(url)
  const proc = url.startsWith('https') ? https : http
  return new Promise((resolve, reject) => {
    proc.get(url, options, function(res) {
      if (encoding) {
        res.setEncoding(encoding)
      }
      var str = "";
      res.on("data", function(chunk) {
        str += chunk; //监听数据响应，拼接数据片段
      })
      res.on("end", function() {
        if (pipe) {
          pipe(str).then(result => {
            resolve(result)
          })
        } else {
          resolve(str)
        }
      })
    })
  })
}