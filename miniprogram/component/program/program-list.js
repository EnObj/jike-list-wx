const channelUtils = require('./../../utils/channelUtils.js')
const db = wx.cloud.database()

// component/program/program-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    programList: Object,
    channel: Object
  },

  observers: {
    'programList': function(programList) {
      if (programList && !this.data.channel) {
        channelUtils.getChannelByCode(db, programList.channelCode).then(channel => {
          this.setData({
            channel: channel
          })
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    channel: null
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})