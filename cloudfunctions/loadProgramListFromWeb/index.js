// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require('http');

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()

  var channelCode = event.channelCode
  var date = event.date

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
              list: cctvItem.list
        }
        db.collection('program_list').add({
          data: programList
        }).then(res=>{
          resolve(programList)
        })
      })
    })
  })
}