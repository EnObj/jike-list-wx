const channelUtils = require('./../../utils/channelUtils.js')
const db = wx.cloud.database()
const _ = db.command
const modeLimit = {
  card: 3,
  page: 8
}

module.exports = Behavior({
  behaviors: [],
  properties: {
    keyword: {
      type: String
    },
    mode: {
      type: String,
      value: 'page'
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
    'more': function(value) {
      if (value && this.data.list.length < this.data.count) {
        this.searchByPage(this.data.list.length, this.query)
      }
    }
  },
  data: {
    count: 0,
    list: null,
    channels: {}
  },
  attached() {
    channelUtils.getChannelList(db).then(channels => {
      this.setData({
        channels: (channels || []).reduce((channelMap, channel) => {
          channelMap[channel.code] = channel
          return channelMap
        }, {})
      })
    })
  },
  methods: {
    search() {
      const query = this.getQuery()
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
    // 子类可以覆写
    getQuery() {
      const where = this.getWhere()
      const query = db.collection('program_list').where({
        list: _.elemMatch({
          seo: db.RegExp({
            regexp: this.data.keyword,
            options: 'i'
          })
        }),
        dateType: 'other',
        ...where
      }).orderBy('date', 'desc')
      return this.orderBy(query)
    },
    getWhere() {
      return {}
    },
    orderBy(where) {return where},
    searchByPage: function(skip, query) {
      wx.showLoading({
        title: '加载中',
      })
      return query.skip(skip).limit(modeLimit[this.data.mode]).get().then(res => {
        var list = res.data
        // 数据处理交给子类
        // list.forEach(programList => {
        //   programList.list = programList.list.filter(program => {
        //     return program.title.indexOf(this.data.keyword) > -1
        //   })
        //   programList.dateObj = dateUtils.getDateObj(dateUtils.int8DateReback(programList.date))
        // })
        wx.hideLoading()
        this.setData({
          list: this.data.list.concat(list)
        })
      })
    }
  }
})