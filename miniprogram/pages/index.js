const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: {},
    locDay: {},
    dateList: [],
    currentDate: {},
    channelList: [],
    currentChannel: {},
    programList: [],
    currentProgram: {},
    userActions: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var locDay = new Date()
    if (options.date) {
      locDay = this.int8DateReback(options.date)
    }
    // 初始化日期（同步）
    this.initDateList(locDay)
    // 初始化频道
    this.initChannelList(options.channel).then(() => {
      // 加载节目单
      this.loadProgramList()
    })
  },

  int8DateReback: function(int8Date) {
    var year = Math.floor(int8Date / 10000)
    var month = Math.floor((int8Date % 10000) / 100) - 1
    var day = Math.floor(int8Date % 100)
    return new Date(year, month, day)
  },

  loadProgramList: function() {
    wx.showLoading({
      title: '加载中'
    })
    var currentChannel = this.data.currentChannel.code
    var currentDate = this.data.currentDate.int8Date
    return db.collection('program_list').where({
      date: currentDate,
      channelCode: currentChannel
    }).get().then(res => {
      this.resolveProgramListFromWeb(res.data[0] && res.data[0].list || []).then(programList => {
        // 求播出状态
        var today = this.data.today
        var currentProgram = programList[0]
        programList.forEach(program => {
          // 得到播放状态
          if (program.startTime * 1000 > today.time) {
            program.status = 'fulture'
          } else if (program.endTime * 1000 < today.time) {
            program.status = 'over'
          } else {
            program.status = 'curr'
            currentProgram = program
          }
          // 求insideId
          program.insideId = this.getProgramInsideId(program)
        })
        this.queryUserActions({
          date: currentDate,
          channel: currentChannel
        }, []).then(userActions => {
          wx.hideLoading()
          this.setData({
            programList: programList,
            currentProgram: currentProgram,
            userActions: userActions.reduce((map, userAction) => {
              map[userAction.programInsideId] = userAction
              return map
            }, {})
          })
          wx.pageScrollTo({
            duration: 300,
            selector: "#current-program"
          })
        })
      })
    })
  },

  queryUserActions: function(where, userActions) {
    var batch = 20
    return db.collection('user_action').where(where).skip(userActions.length).limit(batch).get().then(res => {
      userActions = userActions.concat(res.data)
      if (res.data.length == batch) {
        return queryUserActions(userActions)
      } else {
        return userActions
      }
    })
  },

  resolveProgramListFromWeb: function(programList) {
    if (!programList.length) {
      return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'loadProgramListFromWeb',
          data: {
            channelCode: this.data.currentChannel.code,
            date: this.data.currentDate.int8Date
          }
        }).then(res => {
          resolve(res.result.list || [])
        }).catch(res => {
          console.error(res)
          reject(res)
        })
      })
    } else {
      return Promise.resolve(programList)
    }
  },

  initChannelList: function(channelCode) {
    return db.collection('channel').get().then(res => {
      var channelList = res.data
      var currentChannel = channelList[0]
      if (channelCode) {
        currentChannel = channelList.find(channel => {
          return channel.code == channelCode
        })
      }
      this.setData({
        channelList: channelList,
        currentChannel: currentChannel
      })
    })
  },

  switchDate: function(event) {
    console.log(event)
    this.setData({
      currentDate: event.currentTarget.dataset.date
    })
    // 加载节目单
    this.loadProgramList()
  },

  switchChannel: function(event) {
    console.log(event)
    this.setData({
      currentChannel: event.currentTarget.dataset.channel
    })
    // 加载节目单
    this.loadProgramList()
  },

  initDateList: function(locDay) {
    var locDay = locDay || new Date()
    var dateList = []
    var currentDate = {}
    for (var i = -6; i < 7; i++) {
      var pDate = new Date(locDay.getTime())
      pDate.setDate(pDate.getDate() + i)
      var dayObj = this.getDateObj(pDate)
      dateList.push(dayObj)
      // 今天
      if (i == 0) {
        currentDate = dayObj
      }
    }
    this.setData({
      dateList: dateList.splice((7 - currentDate.week) % 7, 7),
      currentDate: currentDate
    })
    // 此处单独更新是为了自动滚动到当前时间，当前频道
    this.setData({
      currentChannel: this.data.currentChannel,
      locDay: currentDate
    })
  },

  getDateObj: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var week = date.getDay()
    return {
      year: year,
      month: month,
      day: day,
      week: week,
      int8Date: year * 10000 + month * 100 + day,
      showWeek: ['日', '一', '二', '三', '四', '五', '六'][week],
      showDate: year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day),
      time: date.getTime()
    };
  },

  bindDateChange: function(event) {
    console.log(event)
    var value = event.detail.value
    var times = value.split('-')
    var date = new Date(+times[0], +times[1] - 1, times[2])
    this.initDateList(date)
    // 加载节目单
    this.loadProgramList()
  },

  signAction: function(event) {
    var program = this.data.programList[event.currentTarget.dataset.programIndex]

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
        channel: this.data.currentChannel.code,
        date: this.data.currentDate.int8Date,
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
            channel: _this.data.currentChannel.code,
            date: _this.data.currentDate.int8Date,
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

  getProgramInsideId: function(program) {
    return '' + program.startTime + '-' + program.title
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 今日
    this.setData({
      today: this.getDateObj(new Date())
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 此处单独更新是为了自动滚动到当前时间，当前频道
    this.setData({
      currentChannel: this.data.currentChannel,
      locDay: this.data.currentDate
    })
    this.loadProgramList().then(res => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var channel = this.data.currentChannel
    var date = this.data.currentDate
    return {
      title: channel.name + '频道有好节目了，块来围观！',
      path: '/pages/index?channel=' + channel.code + '&date=' + date.int8Date
    }
  }
})