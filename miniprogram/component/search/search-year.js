const searchSomethingBehavior = require('./../behaviors/search-something.js')
const db = wx.cloud.database()
const _ = db.command
const dateFilters = {
  '今年': {
    where: (a) => a,
    sort: 'desc'
  },
  '去年': {
    where: (a) => --a,
    sort: 'asc'
  },
  '更早': {
    where: (a) => _.lt(--a),
    sort: 'asc'
  }
}

// component/search/search-year.js
Component({
  behaviors: [searchSomethingBehavior],

  /**
   * 组件的属性列表
   */
  properties: {
    whereYear: {
      type: String,
      value: '今年'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    getWhere() {
      const nowYear = new Date().getFullYear()
      const yearFilter = dateFilters[this.data.whereYear]
      return {
        date: yearFilter.where(nowYear),
        dateType: 'year'
      }
    },
    searchWhereYear(event) {
      this.setData({
        whereYear: event.currentTarget.dataset.date
      })
      this.search()
    }
  }
})