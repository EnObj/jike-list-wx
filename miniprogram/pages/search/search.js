const dateUtils = require('./../../utils/dateUtils.js')
const channelUtils = require('./../../utils/channelUtils.js')
const db = wx.cloud.database()
const _ = db.command
const dateFilters = {
  '昨日': {
    where: _.lt,
    sort: 'desc'
  },
  '今日': {
    where: (a) => a,
    sort: 'asc'
  },
  '明日': {
    where: _.gt,
    sort: 'asc'
  }
}

// miniprogram/pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: {},
    keyword: '',
    keywords: [],
    whereDate: '今日',
    list: null,
    autoFocus: false,
    channels: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.inpValue = options.keyword || ''
    this.setData({
      autoFocus: !this.inpValue,
      list: !!this.inpValue ? [] : null
    })
  },

  inpChange: function(event) {
    this.inpValue = event.detail.value
  },

  focusInp: function() {
    this.setData({
      list: null,
      whereDate: '今日'
    })
  },

  search: function() {
    wx.showLoading({
      title: '加载中',
    })
    const keyword = this.inpValue
    this.setData({
      keyword: keyword
    })
    const today = this.data.today
    const dateFilter = dateFilters[this.data.whereDate]
    db.collection('program_list').where({
      date: dateFilter.where(today.int8Date),
      list: _.elemMatch({
        title: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      })
    }).orderBy('date', dateFilter.sort).get().then(res => {
      var list = res.data
      list.forEach(programList => {
        programList.searchTargetList = programList.list.filter(program => {
          return program.title.indexOf(keyword) > -1
        })
        programList.dateObj = dateUtils.getDateObj(dateUtils.int8DateReback(programList.date))
      })
      wx.hideLoading()
      this.setData({
        list: list
      })
      this.addToLocalHistory(keyword)
    })
  },

  addToLocalHistory: function(keyword) {
    const _this = this
    var keywords = _this.data.keywords
    if (keywords.indexOf(keyword) < 0) {
      keywords.unshift(keyword)
      wx.setStorage({
        key: 'searchKeywords',
        data: keywords,
        success() {
          _this.setData({
            keywords: keywords
          })
        }
      })
    }
  },

  cleanKeywords: function() {
    var _this = this
    wx.showModal({
      content: '确认清空搜索历史？',
      success(res) {
        if (res.confirm) {
          wx.removeStorage({
            key: 'searchKeywords',
            success: function(res) {
              _this.setData({
                keywords: []
              })
            },
          })
        }
      }
    })
  },

  searchWithDate: function(event) {
    this.setData({
      whereDate: event.currentTarget.dataset.date
    })
    this.search()
  },

  searchKeyword: function(event) {
    this.inpValue = event.currentTarget.dataset.keyword
    this.search()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    if (this.inpValue) {
      this.search()
    }
    const _this = this
    wx.getStorage({
      key: 'searchKeywords',
      success: function(res) {
        _this.setData({
          keywords: res.data || []
        })
      },
    })
    channelUtils.getChannelList(db).then(channels => {
      this.setData({
        channels: (channels || []).reduce((channelMap, channel) => {
          channelMap[channel.code] = channel
          return channelMap
        }, {})
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
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
    var keyword = this.data.keyword
    return {
      title: '即刻节目单又有好节目了，快来搜索“' + keyword + '”试试吧！',
      path: '/pages/search/search?keyword=' + keyword
    }
  }
})