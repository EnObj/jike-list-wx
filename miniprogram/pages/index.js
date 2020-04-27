const dateUtils = require('./../utils/dateUtils.js')
const programUtils = require('./../utils/programUtils.js')
const channelUtils = require('./../utils/channelUtils.js')
const db = wx.cloud.database()
const userProfileUtils = require('./../utils/userProfileUtils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    locDate: '',
    currentDate: null,
    channelList: [],
    currentChannelObj: null,
    programList: null,
    userProfile: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // options.channel = 'nbr-wx'
    // 如果要打开的channel不在关注列表里，去channel页
    if (options.channel) {
      wx.reLaunch({
        url: '/pages/channel/channel?channel=' + options.channel + '&date=' + options.date,
      })
      return
    }
  },

  loadProgramList: function(channelObj, date) {
    wx.showNavigationBarLoading()
    programUtils.loadProgramList(channelObj.code, date, db).then(programList => {
      wx.hideNavigationBarLoading()
      this.setData({
        programList: programList,
        currentDate: date
      })
    })
  },

  initChannelList: function(channelCode) {
    const focusedChannels = this.data.userProfile.focusedChannels
    return channelUtils.getChannelList(db, {
      code: db.command.in(focusedChannels)
    }).then(channelList => {
      if (channelList.length == 0) {
        wx.switchTab({
          url: '/pages/channels',
        })
        return Promise.reject()
      }
      channelList.sort((a, b) => { return focusedChannels.indexOf(a.code) - focusedChannels.indexOf(b.code) })
      var currentChannel = channelList[0]
      if (channelCode) {
        currentChannel = channelList.find(channel => {
          return channel.code == channelCode
        }) || currentChannel
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
    const channel = event.currentTarget.dataset.channel
    this.setData({
      currentChannelObj: channel,
      'locDate': channel.dateType == this.data.currentChannelObj.dateType ? this.data.currentDate : channel.recentDate
    })
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
    // 查询关注列表
    userProfileUtils.getOne(db).then(userProfile => {
      this.setData({
        userProfile: userProfile
      })
      // 初始化关注频道
      this.initChannelList(this.data.currentChannelObj && this.data.currentChannelObj.code).then(channelObj => {
        this.setData({
          locDate: channelObj.recentDate,
          currentChannelObj: channelObj
        })
      })
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
      title: '这个频道有好节目了，快来围观！',
      path: '/pages/index?channel=' + channel + '&date=' + date
    }
  }
})