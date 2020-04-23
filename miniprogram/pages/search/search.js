// miniprogram/pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    keyword: '',
  },

  onLoad: function(options) {
    this.setData({
      options: options
    })
  },

  search: function(event) {
    this.setData({
      keyword: event.detail.value
    })
  },

  focus: function(){
    this.setData({
      keyword: ''
    })
  },

  onReady() {
    if(this.data.options.keyword){
      this.setData({
        keyword: this.data.options.keyword
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var keyword = this.data.keyword
    return {
      title: '又有好节目了，快来即刻搜索“' + keyword + '”试试吧！',
      path: '/pages/search/search?keyword=' + keyword
    }
  }
})