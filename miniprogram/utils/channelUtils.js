module.exports = {
  getChannelList: function(db, where = {}) {
    // 缓存暂时关闭
    // var globalData = getApp().globalData
    // if (globalData.channels) {
    //   return Promise.resolve(globalData.channels)
    // } else {
      
    // }
    return db.collection('channel').where(where).orderBy('sort', 'asc').get().then(res => {
      return res.data
    })
  },

  getChannelByCode: function(db, code){
    return db.collection('channel').where({
      code: code
    }).get().then(res=>{
      return res.data[0]
    })
  }
}