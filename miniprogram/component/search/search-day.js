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
const modeLimit = {
  card: 3,
  page: 8
}

// component/search/search-result-day.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    keyword: {
      type: String
    },
    mode: {
      type: String,
      value: 'page'
    },
    whereDate: {
      type: String,
      value: '今日'
    },
    more: {
      type: Number,
      value: 0
    }
  },

  observers: {
    'keyword': function(value) {
      value && this.search()
    },
    'more': function(value){
      if(value && this.data.list.length < this.data.count){
        this.searchByPage(this.data.list.length, this.query)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    count: 0,
    list: null,
    channels: {}
  },

  lifetimes: {
    attached() {
      channelUtils.getChannelList(db).then(channels => {
        this.setData({
          channels: (channels || []).reduce((channelMap, channel) => {
            channelMap[channel.code] = channel
            return channelMap
          }, {})
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    search() {
      const today = dateUtils.getDateObj(new Date())
      const dateFilter = dateFilters[this.data.whereDate]
      const query = db.collection('program_list').where({
        date: dateFilter.where('' + today.int8Date),
        list: _.elemMatch({
          title: db.RegExp({
            regexp: this.data.keyword,
            options: 'i'
          })
        })
      }).orderBy('date', dateFilter.sort)

      query.count().then(res => {
        this.setData({
          count: res.total,
          list: []
        })
        this.searchByPage(0, query).then(res => {
          this.query = query
        })
      })
    },
    searchByPage: function(skip, query) {
      wx.showLoading({
        title: '加载中',
      })
      return query.skip(skip).limit(modeLimit[this.data.mode]).get().then(res => {
        var list = res.data
        list.forEach(programList => {
          programList.list = programList.list.filter(program => {
            return program.title.indexOf(this.data.keyword) > -1
          })
          programList.dateObj = dateUtils.getDateObj(dateUtils.int8DateReback(programList.date))
        })
        wx.hideLoading()
        this.setData({
          list: this.data.list.concat(list)
        })
      })
    },
    searchWithDate: function(event) {
      this.setData({
        whereDate: event.currentTarget.dataset.date
      })
      this.search()
    },
    searchKeyword: function(event) {
      this.setData({
        keyword: event.detail.value
      })
    },
    focus: function() {
      this.setData({
        list: null
      })
    },
    onReachBottom() {
      console.log('到底了')
    }
  },
})