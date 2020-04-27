const channelUtils = require('./../../utils/channelUtils.js')
const programUtils = require('./../../utils/programUtils.js')
const db = wx.cloud.database()

// component/channel/channel.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    'channel': Object,
    'focused': Boolean,
    'userProfileId': String
  },

  observers:{
    
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
    focus(event) {
      const channel = this.data.channel
      db.collection('user_profile').doc(this.data.userProfileId).update({
        data: {
          focusedChannels: db.command.addToSet(channel.code)
        }
      }).then(res => {
        this.setData({
          focused: true
        })
      })
    },
    unfocus(event) {
      const channel = this.data.channel
      db.collection('user_profile').doc(this.data.userProfileId).update({
        data: {
          focusedChannels: db.command.pull(channel.code)
        }
      }).then(res => {
        this.setData({
          focused: false
        })
      })
    },
  }
})
