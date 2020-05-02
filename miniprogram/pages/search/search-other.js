// miniprogram/pages/search/search-other.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: null,
    keyword: '',
    more: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (this.data.options.keyword) {
      this.setData({
        keyword: this.data.options.keyword
      })
    }
  },

  focus: function () {
    this.setData({
      keyword: ''
    })
  },

  search: function (event) {
    this.setData({
      keyword: event.detail.value
    })
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
    this.setData({
      more: ++this.data.more
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})