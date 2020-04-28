module.exports = {
  getChannelList: function(db, where = {}, skip=0, limit=20) {
    return db.collection('channel').where(where).orderBy('createTime', 'asc').skip(skip).limit(limit).get().then(res => {
      return res.data
    })
  },

  getChannelByCode: function(db, code){
    return db.collection('channel').where({
      code: code
    }).get().then(res=>{
      return res.data[0]
    })
  }
}