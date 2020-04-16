const mongoose = require('mongoose');

taskSchema  =  mongoose.Schema({
  description:{
    type : String,
    required : true,
    trim : true 
  },
  isCompleted : {
      type: Boolean,
      default: false,
  },
  owner :{
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'user'
  }
},{
  timestamps : true
})
const task = mongoose.model('task',taskSchema)

module.exports = task ;