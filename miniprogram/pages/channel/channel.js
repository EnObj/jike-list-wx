const programUtils = require('./../../utils/programUtils.js')
const channelUtils = require('./../../utils/channelUtils.js')
const db = wx.cloud.database()

// miniprogram/pages/channel/channel.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: null,
    currentDate: null,
    programList: null,
    channel: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 日期未传，默认今日
    options.date = +options.date || dateUtils.getDateObj(new Date()).int8Date
    // 查询频道对象
    channelUtils.getChannelByCode(db, options.channel).then(channel=>{
      this.setData({
        channel: channel
      })
      wx.setNavigationBarTitle({
        title: channel.name,
      })
    })
    this.setData({
      options: options,
      currentDate: options.date
    })
  },

  loadProgramList: function (date) {
    wx.showLoading({
      title: '加载中'
    })
    programUtils.loadProgramList(this.options.channel, date, db).then(programList => {
      wx.hideLoading()
      this.setData({
        programList: programList,
        currentDate: date
      })
    })
  },

  switchDate: function (event) {
    console.log(event)
    // 加载节目单
    this.loadProgramList(+event.detail)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})