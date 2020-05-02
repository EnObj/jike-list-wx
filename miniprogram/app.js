//app.js
App({
  onLaunch: function() {

    wx.cloud.init({
      env: 'jike-v2-hnr1l',
      // env: 'jike-mr6e0',
      traceUser: true,
    })

    this.globalData = {}
  }
})