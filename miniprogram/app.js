//app.js
App({
  onLaunch: function() {

    wx.cloud.init({
      // 生产
      // env: 'jike-v2-hnr1l',
      // 开发
      env: 'jike-mr6e0',
      traceUser: true,
    })

    this.globalData = {}
  }
})