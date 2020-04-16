const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task=require('./task')
const userSchema = mongoose.Schema({
    name :{
        type :String,
        required :true,
        trim : true
    },
    email :{
        type :String,
        unique:true,
        trim : true,
        lowercase : true,
        required : true,
        validate(value){
            if(!validator.isEmail(value)) {
                throw new Error('email is invaliid')
            }
        }
    },
    age : {
        type : Number,
        default : 30,
        validate(value) {
            if (value < 0){
                throw new Error ('age must be greater than zero')
            }
        }

    },
    passward : {
        type : String,
        required : true,
        minlength : 6,
        trim : true,
        validate(value){
            if(value.includes('passward')){
                throw new Error ('passward cannot contain passward')
            }
        }
    },
    tokens : [{
        token:{
            type : String,
            required : true
        }
    }],
    avatar:{
        type:Buffer

    }
    
},{
    timestamps:true,
})
userSchema.virtual('tasks',{
    ref:'task',
    localField: '_id',
    foreignField :'owner'
})


userSchema.methods.toJSON = function(){
    const user = this;
    const userObject =  user.toObject();
    delete userObject.tokens;
    delete userObject.passward;
    delete userObject.avatar;


    return userObject;

}

userSchema.methods.generatAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id :user._id.toString()}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token ;

}

userSchema.statics.findByCredentials = async (email,passward)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error("unable to login")
    }
     const isMatched = await bcrypt.compare(passward,user.passward);
    if(!isMatched){
        throw new Error("unable to login pass");
    }
    return user;
}
// hash the plane passward before saving
userSchema.pre('save',async function(next){
    const user = this;

    if(user.isModified("passward")){
        user.passward = await bcrypt.hash(user.passward,8);
    }
    next();
})

userSchema.pre('remove',async function(next){
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
    

})




const User = mongoose.model('user',userSchema)
module.exports = User ;
