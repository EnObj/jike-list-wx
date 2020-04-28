const dateUtils = require('./../../utils/dateUtils.js')

// component/program/date-selector.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    locDate: Number,
    start: Number,
    end: Number
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
      this.triggerEvent('switchdate', currentYear, {})
    },
    'locDate': function(value) {
      value = value || this.data.end || new Date().getFullYear()
      this.initYearList(+value)
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
      var nowYear = new Date().getFullYear()
      for (var i = -5; i < 10; i++) {
        const value = locYear - i
        if (value <= this.data.end && value <= nowYear && yearList.length < 10){
          yearList.push(value)
        }
      }
      this.setData({
        yearList: yearList,
        currentYear: locYear
      })
    },

    bindDateChange: function(event) {
      console.log(event)
      var value = event.detail.value
      this.setData({
        locDate: +value
      })
    },

    switchDate: function(event) {
      console.log(event)
      this.setData({
        currentYear: event.currentTarget.dataset.year
      })
    },
  }
})