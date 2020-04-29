// component/search/search-inp.js
Component({
  properties: {
    keyword: {
      type: String,
      valu: '',
      observer: function(value) {
        this.setData({
          focus: !value,
          value: value,
          inpValue: value
        })
      }
    }
  },

  data: {
    value: '',
    keywords: [],
    focus: true,
    inpValue: ''
  },

  attached() {
    const _this = this
    wx.getStorage({
      key: 'searchKeywords',
      success: function(res) {
        _this.setData({
          keywords: res.data || []
        })
      },
    })
  },

  methods: {

    inpChange: function(event) {
      this.setData({
        inpValue: event.detail.value
      })
    },

    focusInp: function() {
      this.triggerEvent('focus', {}, {})
    },

    search: function() {
      const keyword = this.data.inpValue
      if (keyword){
        this.triggerEvent('keywordchange', {
          value: keyword
        }, {})
        this.setData({
          value: keyword
        })
        this.addToLocalHistory(keyword)
      }
    },

    addToLocalHistory: function(keyword) {
      const _this = this
      var keywords = _this.data.keywords
      if (keywords.indexOf(keyword) < 0) {
        keywords.unshift(keyword)
        wx.setStorage({
          key: 'searchKeywords',
          data: keywords,
          success() {
            _this.setData({
              keywords: keywords
            })
          }
        })
      }
    },

    cleanKeywords: function() {
      var _this = this
      wx.showModal({
        content: '确认清空搜索历史？',
        success(res) {
          if (res.confirm) {
            wx.removeStorage({
              key: 'searchKeywords',
              success: function(res) {
                _this.setData({
                  keywords: []
                })
              },
            })
          }
        }
      })
    },

    searchKeyword: function(event) {
      this.setData({
        inpValue: event.currentTarget.dataset.keyword
      })
      this.search()
    }
  }
})