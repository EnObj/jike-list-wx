const dateUtils = require('./../../utils/dateUtils.js')
const db = wx.cloud.database()

// component/program/program-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    channel: String,
    date: Number,
    list: {
      type: Array,
      value: []
    }
  },

  observers: {
    'channel, date': function (channel, date){
      // 查询用户动作
      this.queryUserActions({
        date: this.data.date,
        channel: this.data.channel
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
          date: this.data.date,
          channel: this.data.channel
        }
      }).then(res => {
        this.setData({
          hotStates: res.result.list.reduce((map, hotState) => {
            map[hotState._id] = hotState.num
            return map
          }, {})
        })
      })
    },
    'list': function(list){
      var currentProgram = list[0] || {}
      list.forEach((program, index) => {
        // 求insideId
        program.insideId = this.getProgramInsideId(program)
        // 得到播放状态
        if (program.startTime * 1000 > Date.now()) {
          program.status = 'fulture'
        } else if (program.endTime * 1000 < Date.now()) {
          program.status = 'over'
        } else {
          program.status = 'curr'
          currentProgram = program
        }
      })
      this.setData({
        programs: list,
        currentProgram: currentProgram
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    userActions: {},
    hotStates: {},
    currentProgram: null,
    programs: []
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
      var program = this.data.list[event.currentTarget.dataset.programIndex]

      var promise = Promise.resolve({})
      if (program.status == 'fulture') {
        promise = new Promise((resolve, reject) => {
          var tmplId = 'PeNNc-AQ5M2ZLE6BniC5YJwCcVAd1UVlsq7dZEz1n0w'
          wx.requestSubscribeMessage({
            tmplIds: [tmplId],
            success(res) {
              console.log(res)
              if (res[tmplId] == 'accept') {
                resolve({
                  needNotify: true
                })
              } else {
                resolve({
                  needNotify: false
                })
              }
            },
            fail(res) {
              console.log(res)
              resolve({
                needNotify: false
              })
            }
          })
        })
      }

      promise.then(res => {
        var userAction = {
          channel: this.data.channel,
          date: this.data.date,
          programInsideId: program.insideId,
          program: program
        }
        if (res.needNotify) {
          userAction.needNotify = true
          userAction.notify = {
            status: 'wait'
          }
        }
        db.collection('user_action').add({
          data: userAction
        }).then(res => {
          db.collection('user_action').doc(res._id).get().then(res => {
            var userAction = res.data
            var userActions = this.data.userActions
            userActions[userAction.programInsideId] = userAction
            this.setData({
              userActions: userActions
            })
          })
        })
      })
    },

    unsignAction: function(event) {
      const _this = this
      var userActions = _this.data.userActions
      const programInsideId = event.currentTarget.dataset.programInsideId
      const content = '确定取消标记' + (userActions[programInsideId].needNotify ? '和提醒？' : '？')
      wx.showModal({
        content: content,
        success(res) {
          if (res.confirm) {
            db.collection('user_action').where({
              channel: _this.data.channel,
              date: _this.data.date,
              programInsideId: programInsideId,
            }).remove().then(res => {
              delete userActions[programInsideId]
              _this.setData({
                userActions: userActions
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
    },

    getProgramInsideId: function(program) {
      return '' + program.startTime + '-' + program.title
    }
  }
})