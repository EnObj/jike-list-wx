const dateUtils = require('./../../utils/dateUtils.js')
const db = wx.cloud.database()
const programListBehavior = require('./../behaviors/program-list.js')

// component/program/program-list.js
Component({

  behaviors: [programListBehavior],

  /**
   * 组件的属性列表
   */
  properties: {

  },

  observers: {
    'programList': function(programList) {
      if (!programList){
        return
      }
      var currentProgram = programList.list[0] || {}
      const programs = programList.list.map((program, index) => {
        // 得到播放状态
        if (program.startTime * 1000 > Date.now()) {
          program.status = 'fulture'
        } else if (program.endTime * 1000 < Date.now()) {
          program.status = 'over'
        } else {
          program.status = 'curr'
          currentProgram = program
        }
        return program
      })
      this.setData({
        programs: programs,
        currentProgram: currentProgram
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentProgram: null,
    programs: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    signWithMore(program) {
      if (program.status == 'fulture') {
        return new Promise((resolve, reject) => {
          var tmplId = 'PeNNc-AQ5M2ZLE6BniC5YJwCcVAd1UVlsq7dZEz1n0w'
          wx.requestSubscribeMessage({
            tmplIds: [tmplId],
            success(res) {
              console.log(res)
              if (res[tmplId] == 'accept') {
                resolve({
                  needNotify: true,
                  notify: {
                    status: 'wait'
                  }
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
      return Promise.resolve({})
    },
  }
})