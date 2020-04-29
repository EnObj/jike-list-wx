const channelUtils = require('./../utils/channelUtils.js')
const userProfileUtils = require('./../utils/userProfileUtils.js')
const db = wx.cloud.database()

// miniprogram/pages/channels.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    channels: [],
    more: true,
    focusedMap: {},
    userProfile: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadFocusedMap()
    this.loadChannels()
  },

  loadFocusedMap(){
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

  loadChannels(limit=10){
    wx.showLoading({
      title: '正在加载',
    })
    return channelUtils.getChannelList(db, {}, this.data.channels.length, limit).then(channels => {
      wx.hideLoading()
      this.setData({
        channels: this.data.channels.concat(channels),
        more: channels.length == limit
      })
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
    this.setData({
      channels: []
    })
    this.loadChannels()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if(this.data.more){
      this.loadChannels()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '所有频道都在这里啦！',
      path: '/pages/channels'
    }
  }
})