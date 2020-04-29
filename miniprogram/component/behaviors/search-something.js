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
    list: null
  },
  attached() {
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
          title: db.RegExp({
            regexp: this.data.keyword,
            options: 'i'
          })
        }),
        dateType: 'other',
        ...where
      })
      return this.orderBy(query)
    },
    getWhere() {
      return {}
    },
    orderBy(where) { return where.orderBy('date', 'desc')},
    searchByPage: function(skip, query) {
      wx.showLoading({
        title: '加载中',
      })
      return query.skip(skip).limit(modeLimit[this.data.mode]).get().then(res => {
        var list = this.afterQuery(res.data)
        wx.hideLoading()
        this.setData({
          list: this.data.list.concat(list)
        })
      })
    },
    afterQuery(list){
      return list
    }
  }
})