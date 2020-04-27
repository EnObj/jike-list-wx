const searchSomethingBehavior = require('./../behaviors/search-something.js')
const dateUtils = require('./../../utils/dateUtils')
const db = wx.cloud.database()
const _ = db.command
const dateFilters = {
  '历史': {
    where: _.lt,
    sort: 'desc'
  },
  '今日': {
    where: (a) => a,
    sort: 'asc'
  },
  '预告': {
    where: _.gt,
    sort: 'asc'
  }
}

// component/search/search-result-day.js
Component({
  behaviors: [searchSomethingBehavior],

  /**
   * 组件的属性列表
   */
  properties: {
    whereDate: {
      type: String,
      value: '今日'
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
      const today = dateUtils.getDateObj(new Date())
      const dateFilter = dateFilters[this.data.whereDate]
      return {date: dateFilter.where(today.int8Date),
      dateType: 'day'}
    },

    orderBy(where){
      const today = dateUtils.getDateObj(new Date())
      const dateFilter = dateFilters[this.data.whereDate]
      return where.orderBy('date', dateFilter.sort)
    },

    afterQuery(list){
      list.forEach(programList=>{
        programList.list = programList.list.filter(program=>{
          return program.title.indexOf(this.data.keyword) >= 0
        })
        programList.dateObj = dateUtils.getDateObj(dateUtils.int8DateReback(programList.date))
      })
      return list
    },

    searchWithDate(event){
      this.setData({
        whereDate: event.currentTarget.dataset.date
      })
      this.search()
    }
  }
})