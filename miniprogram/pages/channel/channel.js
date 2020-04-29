const programUtils = require('./../../utils/programUtils.js')
const channelUtils = require('./../../utils/channelUtils.js')
const userProfileUtils = require('./../../utils/userProfileUtils.js')
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
    channel: null,
    focusedMap: {},
    userProfile: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadFocusedMap()
    // 查询频道对象
    channelUtils.getChannelByCode(db, options.channel).then(channel=>{
      this.setData({
        channel: channel,
        options: options,
        currentDate: options.date
      })
      wx.setNavigationBarTitle({
        title: channel.name,
      })
    })
  },

  loadFocusedMap() {
    userProfileUtils.getOne(db).then(userProfile => {
      this.setData({
        focusedMap: userProfile.focusedChannels.reduce((map, channel) => {
          map[channel] = true
          return map
        }, {}),
        userProfile: userProfile
      })
    })
  },

  loadProgramList: function (date) {
    wx.showNavigationBarLoading()
    programUtils.loadProgramList(this.options.channel, date, db).then(programList => {
      wx.hideNavigationBarLoading()
      this.setData({
        programList: programList,
        currentDate: date
      })
    })
  },

  switchDate: function (event) {
    console.log(event)
    // 加载节目单
    this.loadProgramList(event.detail)
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
    return {
      title: '这个频道有好节目了，快来围观！',
      path: '/pages/channel/channel?channel=' + this.data.channel.code + '&date=' + this.data.currentDate
    }
  }
})