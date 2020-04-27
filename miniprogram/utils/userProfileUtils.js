module.exports={
  getOne: function(db){
    return db.collection('user_profile').where({}).get().then(res => {
      var profile = res.data[0]
      if (!profile) {
        return newOne(db)
      }
      return profile
    })
  }
}

const newOne = function (db) {
  return db.collection('user_profile').add({
    data: {
      createTime: new Date(),
      focusedChannels: ['cctv1','nbe-wx']
    }
  }).then(res => {
    return db.collection('user_profile').doc(res._id).get().then(res => {
      return res.data
    })
  })
}