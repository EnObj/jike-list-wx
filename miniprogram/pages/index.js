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
    currentChannelObj: null,
    programList: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 日期类型未传，默认day
    options.dateType = options.dateType || 'day'
    // 日期未传，默认值动态确定
    if (!options.date) {
      if (options.dateType == 'day') {
        options.date = '' + dateUtils.getDateObj(new Date()).int8Date
      }
      if (options.dateType == 'year') {
        options.date = '' + new Date().getFullYear()
      }
    }
    // 初始化频道
    this.initChannelList(options.channel, options.dateType).then(channelObj => {
      options.channel = channelObj.code
      this.setData({
        options: options,
        currentChannelObj: channelObj,
        currentDate: options.date
      })
    })
  },

  loadProgramList: function(channelObj, date) {
    wx.showLoading({
      title: '加载中'
    })
    programUtils.loadProgramList(channelObj.code, date, db).then(programList => {
      wx.hideLoading()
      this.setData({
        programList: programList,
        currentChannelObj: channelObj,
        currentDate: date
      })
    })
  },

  initChannelList: function(channelCode, dateType) {
    return channelUtils.getChannelList(db, {
      dateType: dateType
    }).then(channelList => {
      var currentChannel = channelList[0]
      if (channelCode) {
        currentChannel = channelList.find(channel => {
          return channel.code == channelCode
        })
      }
      this.setData({
        channelList: channelList
      })
      return currentChannel
    })
  },

  switchDate: function(event) {
    console.log(event)
    // 加载节目单
    this.loadProgramList(this.data.currentChannelObj, '' + event.detail)
  },

  switchChannel: function(event) {
    console.log(event)
    // 加载节目单
    this.loadProgramList(event.currentTarget.dataset.channel, this.data.currentDate)
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
      title: '这个频道有好节目了，快来围观！',
      path: '/pages/index?channel=' + channel + '&date=' + date
    }
  }
})