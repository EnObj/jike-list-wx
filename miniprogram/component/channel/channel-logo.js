const channelUtils = require('./../../utils/channelUtils.js')
const db = wx.cloud.database()
// component/channel/channel-logo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    channelCode: String,
    channel: Object
  },

  observers:{
    'channelCode': function(value){
      if (value){
        channelUtils.getChannelByCode(db, value).then(channel=>{
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
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
