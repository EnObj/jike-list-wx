module.exports = {
  loadProgramList: function(channel, date, db) {
    return db.collection('program_list').where({
      date: date,
      channelCode: channel
    }).get().then(res => {
      return resolveProgramListFromWeb(res.data[0] && res.data[0].list || [], channel, date)
    })
  }
}

const resolveProgramListFromWeb = function(programList, channelCode, date) {
  if (!programList.length) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'loadProgramListFromWeb',
        data: {
          channelCode: channelCode,
          date: date
        }
      }).then(res => {
        resolve(res.result.list || [])
      }).catch(res => {
        console.error(res)
        reject(res)
      })
    })
  } else {
    return Promise.resolve(programList)
  }
}