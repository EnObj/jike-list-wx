const dateUtils = require('./../utils/dateUtils.js')
const programUtils = require('./../utils/programUtils.js')
const channelUtils = require('./../utils/channelUtils.js')
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: null,
    currentDate: null,
    channelList: [],
    currentChannel: null,
    programList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 日期未传，默认今日
    options.date = +options.date || dateUtils.getDateObj(new Date()).int8Date
    // 初始化频道
    this.initChannelList(options.channel).then(channel => {
      options.channel = channel
      this.setData({
        options: options,
        currentChannel: options.channel,
        currentDate: options.date
      })
    })
  },

  loadProgramList: function(channel, date) {
    wx.showLoading({
      title: '加载中'
    })
    programUtils.loadProgramList(channel, date, db).then(list => {
      wx.hideLoading()
      this.setData({
        programList: list,
        currentChannel: channel,
        currentDate: date
      })
    })
  },

  initChannelList: function(channelCode) {
    return channelUtils.getChannelList(db).then(channelList => {
      var currentChannel = channelList[0]
      if (channelCode) {
        currentChannel = channelList.find(channel => {
          return channel.code == channelCode
        })
      }
      this.setData({
        channelList: channelList
      })
      return currentChannel.code
    })
  },

  switchDate: function(event) {
    console.log(event)
    // 加载节目单
    this.loadProgramList(this.data.currentChannel, +event.detail)
  },

  switchChannel: function(event) {
    console.log(event)
    // 加载节目单
    this.loadProgramList(event.currentTarget.dataset.channel.code, this.data.currentDate)
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
      path: '/pages/index?channel=' + channel + '&date=' + date
    }
  }
})