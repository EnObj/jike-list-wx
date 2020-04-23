const dateUtils = require('./../../utils/dateUtils.js')

// component/program/date-selector.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    locYear: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    nowYear: null,
    yearList: [],
    currentYear: null
  },

  observers: {
    'currentYear': function(currentYear) {
      this.triggerEvent('switchyear', currentYear, {})
    },
    'locYear': function(value) {
      if (value) {
        // 初始化日期（同步）
        this.initYearList(value)
      }
    }
  },

  lifetimes: {
    attached: function() {
      // 今日
      this.setData({
        nowYear: new Date().getFullYear()
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initYearList: function(locYear) {
      var yearList = []
      for (var i = 0; i < 10; i++) {
        yearList.push(locYear - i)
      }
      this.setData({
        yearList: yearList,
        currentYear: locYear
      })
    },

    bindDateChange: function(event) {
      console.log(event)
      var value = event.detail.value
      this.initYearList(+value)
    },

    switchDate: function(event) {
      console.log(event)
      this.setData({
        currentYear: event.currentTarget.dataset.year
      })
    },
  }
})