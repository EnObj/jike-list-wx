// component/program/date-selector/th-selector.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    locDate: Number,
    start: {
      type: Number,
      value: 1
      },
    end: Number,
    thName: {
      type: String,
      value: '届'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    thList: [],
    currentTh: null
  },

  observers: {
    'currentTh': function (currentTh) {
      if (!currentTh){
        this.setData({
          currentTh: this.data.end
        })
      }
      this.triggerEvent('switchdate', currentTh, {})
    },
    'end': function (value) {
      this.initThList(value)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initThList: function (end) {
      var thList = []
      for (var i = end; i >= 1; i--) {
        thList.push(i)
      }
      this.setData({
        thList: thList,
        currentTh: this.data.locDate || end
      })
    },

    switchDate: function (event) {
      console.log(event)
      this.setData({
        currentTh: event.currentTarget.dataset.th
      })
    },
  }
})
