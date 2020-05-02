const searchSomethingBehavior = require('./../behaviors/search-something.js')
const db = wx.cloud.database()
const _ = db.command

// component/search/search-other.js
Component({
  behaviors: [searchSomethingBehavior],

  /**
   * 组件的属性列表
   */
  properties: {

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
      return {
        dateType: _.nin(['day','year'])
      }
    }
  }
})
