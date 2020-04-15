module.exports = {
  getChannelList: function(db) {
    var globalData = getApp().globalData
    if (globalData.channels) {
      return Promise.resolve(globalData.channels)
    } else {
      return db.collection('channel').get().then(res => {
        return globalData.channels = res.data
      })
    }
  },
}