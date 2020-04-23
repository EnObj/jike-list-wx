const db = wx.cloud.database()
const channelUtils = require('./../../utils/channelUtils.js')

module.exports = Behavior({
  behaviors: [],

  properties: {
    programList: {
      type: Object,
      observer: function(programList) {
        // 查询用户动作
        this.queryUserActions({
          date: programList.date,
          channel: programList.channelCode
        }, []).then(userActions => {
          this.setData({
            userActions: userActions.reduce((map, userAction) => {
              map[userAction.programInsideId] = userAction
              return map
            }, {})
          })
        })
        // 查询热度
        wx.cloud.callFunction({
          name: 'queryHotState',
          data: {
            date: programList.date,
            channel: programList.channelCode
          }
        }).then(res => {
          this.setData({
            hotStates: res.result.list.reduce((map, hotState) => {
              map[hotState._id] = hotState.num
              return map
            }, {})
          })
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    userActions: {},
    hotStates: {}
  },

  lifetimes: {
    attached: function() {

    }
  },

  pageLifetimes: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    signAction: function(event) {
      var program = this.data.programList.list[event.currentTarget.dataset.programIndex]
      // 给子组件机会打标
      this.signWithMore(program).then(more => {

        var userAction = {
          ...more,
          channel: this.data.programList.channelCode,
          date: this.data.programList.date,
          programInsideId: program.insideId,
          program: program
        }

        db.collection('user_action').add({
          data: userAction
        }).then(res => {
          db.collection('user_action').doc(res._id).get().then(res => {
            // 把userAction添加到本地
            var userAction = res.data
            var userActions = this.data.userActions
            userActions[userAction.programInsideId] = userAction
            // 改变hot值
            var hotStates = this.data.hotStates
            var hotState = hotStates[userAction.programInsideId] || 0
            hotState++
            hotStates[userAction.programInsideId] = hotState
            this.setData({
              userActions: userActions,
              hotStates: hotStates
            })
          })
        })
      })

    },

    signWithMore(program) {
      return Promise.resolve({})
    },

    unsignAction: function(event) {
      const _this = this
      var userActions = _this.data.userActions
      const programInsideId = event.currentTarget.dataset.programInsideId
      const content = '确定取消标记？'
      wx.showModal({
        content: content,
        success(res) {
          if (res.confirm) {
            db.collection('user_action').where({
              channel: _this.data.programList.channelCode,
              date: _this.data.programList.date,
              programInsideId: programInsideId,
            }).remove().then(res => {
              // 删除本地userAction
              delete userActions[programInsideId]
              // 改变hot值
              var hotStates = _this.data.hotStates
              var hotState = hotStates[programInsideId] || 0
              hotState--
              hotStates[programInsideId] = hotState
              _this.setData({
                userActions: userActions,
                hotStates: hotStates
              })
            })
          }
        }
      })
    },

    queryUserActions: function(where, userActions) {
      var batch = 20
      return db.collection('user_action').where(where).skip(userActions.length).limit(batch).get().then(res => {
        userActions = userActions.concat(res.data)
        if (res.data.length == batch) {
          return this.queryUserActions(where, userActions)
        } else {
          return userActions
        }
      })
    }
  }
})