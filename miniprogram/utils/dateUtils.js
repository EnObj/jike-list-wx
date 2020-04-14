module.exports={
  getDateObj: function (date) {
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
  
  int8DateReback: function (int8Date) {
    var year = Math.floor(int8Date / 10000)
    var month = Math.floor((int8Date % 10000) / 100) - 1
    var day = Math.floor(int8Date % 100)
    return new Date(year, month, day)
  },
}