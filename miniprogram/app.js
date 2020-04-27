//app.js
App({
  onLaunch: function() {

    wx.cloud.init({
      env: 'jike-v2-hnr1l',
      traceUser: true,
    })

    const db = wx.cloud.database()

    

    this.globalData = {}
  }
})