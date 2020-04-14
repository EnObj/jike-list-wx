const dateUtils = require('./../utils/dateUtils.js')
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
    currentChannel: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var locDay = new Date()
    if (options.date) {
      locDay = dateUtils.int8DateReback(options.date)
    }
    // 初始化日期（同步）
    this.initDateList(locDay)
    // 初始化频道
    this.initChannelList(options.channel).then(() => {
      // 加载节目单
      this.loadProgramList()
    })
  },

  loadProgramList: function() {
    wx.showLoading({
      title: '加载中'
    })
    var currentChannel = this.data.currentChannel.code
    var currentDate = this.data.currentDate.int8Date
    return db.collection('program_list').where({
      date: currentDate,
      channelCode: currentChannel
    }).get().then(res => {
      this.resolveProgramListFromWeb(res.data[0] && res.data[0].list || []).then(programList => {
        wx.hideLoading()
        this.setData({
          programList: programList,
          currentProgram: {
            code: 'curr'
          }
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
          resolve(res.result.list || [])
        }).catch(res => {
          console.error(res)
          reject(res)
        })
      })
    } else {
      return Promise.resolve(programList)
    }
  },

  initChannelList: function(channelCode) {
    return db.collection('channel').get().then(res => {
      var channelList = res.data
      var currentChannel = channelList[0]
      if (channelCode) {
        currentChannel = channelList.find(channel => {
          return channel.code == channelCode
        })
      }
      this.setData({
        channelList: channelList,
        currentChannel: currentChannel
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
      var dayObj = dateUtils.getDateObj(pDate)
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
      today: dateUtils.getDateObj(new Date())
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
    var channel = this.data.currentChannel
    var date = this.data.currentDate
    return {
      title: channel.name + '频道有好节目了，快来围观！',
      path: '/pages/index?channel=' + channel.code + '&date=' + date.int8Date
    }
  }
})