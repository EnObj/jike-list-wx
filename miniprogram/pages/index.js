const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: {},
    locDay: {},
    dateList: [],
    currentDate: {},
    channelList: [],
    currentChannel: {},
    programList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初始化日期（同步）
    this.initDateList()
    // 初始化频道
    this.initChannelList().then(() => {
      // 加载节目单
      this.loadProgramList()
    })
  },

  loadProgramList: function() {
    wx.showLoading({
      title: '加载中'
    })
    return db.collection('program_list').where({
      date: this.data.currentDate.int8Date,
      channelCode: this.data.currentChannel.code
    }).get().then(res => {
      this.resolveProgramListFromWeb(res.data[0] && res.data[0].list || []).then(programList => {
        // 求播出状态
        var today = this.data.today
        programList.forEach(program => {
          if (program.startTime * 1000 > today.time) {
            program.status = 'fulture'
          } else if (program.endTime * 1000 < today.time) {
            program.status = 'over'
          } else {
            program.status = 'curr'
          }
        })
        wx.hideLoading()
        this.setData({
          programList: programList
        })
      })
    })
  },

  resolveProgramListFromWeb: function(programList) {
    if (!programList.length) {
      return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'loadProgramListFromWeb',
          data: {
            channelCode: this.data.currentChannel.code,
            date: this.data.currentDate.int8Date
          }
        }).then(res => {
          resolve(res.result.list||[])
        }).catch(res => {
          console.error(res)
          reject(res)
        })
      })
    } else {
      return Promise.resolve(programList)
    }
  },

  initChannelList: function() {
    return db.collection('channel').get().then(res => {
      this.setData({
        channelList: res.data,
        currentChannel: res.data[0]
      })
    })
  },

  switchDate: function(event) {
    console.log(event)
    this.setData({
      currentDate: event.currentTarget.dataset.date
    })
    // 加载节目单
    this.loadProgramList()
  },

  switchChannel: function(event) {
    console.log(event)
    this.setData({
      currentChannel: event.currentTarget.dataset.channel
    })
    // 加载节目单
    this.loadProgramList()
  },

  initDateList: function(locDay) {
    var locDay = locDay || new Date()
    var dateList = []
    var currentDate = {}
    for (var i = -6; i < 7; i++) {
      var pDate = new Date(locDay.getTime())
      pDate.setDate(pDate.getDate() + i)
      var dayObj = this.getDateObj(pDate)
      dateList.push(dayObj)
      // 今天
      if (i == 0) {
        currentDate = dayObj
      }
    }
    this.setData({
      dateList: dateList.splice((7 - currentDate.week) % 7, 7),
      currentDate: currentDate
    })
    // 此处单独更新是为了自动滚动到当前时间，当前频道
    this.setData({
      currentChannel: this.data.currentChannel,
      locDay: currentDate
    })
  },

  getDateObj: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var week = date.getDay()
    return {
      year: year,
      month: month,
      day: day,
      week: week,
      int8Date: year * 10000 + month * 100 + day,
      showWeek: ['日', '一', '二', '三', '四', '五', '六'][week],
      showDate: year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day),
      time: date.getTime()
    };
  },

  bindDateChange: function(event) {
    console.log(event)
    var value = event.detail.value
    var times = value.split('-')
    var date = new Date(+times[0], +times[1] - 1, times[2])
    this.initDateList(date)
    // 加载节目单
    this.loadProgramList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 今日
    this.setData({
      today: this.getDateObj(new Date())
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 此处单独更新是为了自动滚动到当前时间，当前频道
    this.setData({
      currentChannel: this.data.currentChannel,
      locDay: this.data.currentDate
    })
    this.loadProgramList().then(res => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})