const searchSomethingBehavior = require('./../behaviors/search-something.js')
const userProfileUtils = require('./../../utils/userProfileUtils.js')
const db = wx.cloud.database()
// component/search/search-channel.js
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
    focusedMap: {},
    userProfile: {}
  },

  lifetimes:{
    attached(){
      userProfileUtils.getOne(db).then(userProfile => {
        this.setData({
          focusedMap: userProfile.focusedChannels.reduce((map, channel) => {
            map[channel] = true
            return map
          }, {}),
          userProfile: userProfile
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getQuery(){
      return db.collection('channel').where({
        name: db.RegExp({
          regexp: this.data.keyword,
          options: 'i'
        })
      })
    }
  }
})
