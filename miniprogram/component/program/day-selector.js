const dateUtils = require('./../../utils/dateUtils.js')

// component/program/date-selector.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    locDate: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    locDay: null,
    today: null,
    dateList: [],
    currentDate: null
  },

  observers: {
    'currentDate.int8Date': function (int8Date) {
      this.triggerEvent('switchdate', int8Date, {})
    },
    'locDate': function (value) {
      if (value) {
        // 初始化日期（同步）
        this.initDateList(dateUtils.int8DateReback(value))
      }
    }
  },

  lifetimes: {
    attached: function () {
      // 今日
      this.setData({
        today: dateUtils.getDateObj(new Date())
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initDateList: function (locDate) {
      var dateList = []
      var currentDate = {}
      for (var i = -6; i < 7; i++) {
        var pDate = new Date(locDate.getTime())
        pDate.setDate(pDate.getDate() + i)
        var dayObj = dateUtils.getDateObj(pDate)
        dateList.push(dayObj)
        // 今天
        if (i == 0) {
          currentDate = dayObj
        }
      }
      this.setData({
        dateList: dateList.splice((7 - currentDate.week) % 7, 7),
        currentDate: currentDate,
        locDay: currentDate
      })
      // // 此处单独更新是为了自动滚动到当前时间，当前频道
      // this.setData({
      // currentChannel: this.data.currentChannel,
      // locDay: currentDate
      // })
    },

    bindDateChange: function (event) {
      console.log(event)
      var value = event.detail.value
      var times = value.split('-')
      var date = new Date(+times[0], +times[1] - 1, times[2])
      this.initDateList(date)
    },

    switchDate: function (event) {
      console.log(event)
      this.setData({
        currentDate: event.currentTarget.dataset.date
      })
    },
  }
})