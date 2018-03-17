let mongoose = require(`mongoose`);
let bcrypt = require(`bcrypt-nodejs`);

let UserSchema =new mongoose.Schema({
    email:{type: String, unique:true, lowercase: true},
    password:String,
    profile:{
        name:{type:String, default:''},
        picture:{type:String, default:''}
    },
    history:[{
        date:Date
    }]
});

UserSchema.pre('save',function(next){
    let user = this ;
    if(!user.isModified('password'))
        return next();

    bcrypt.genSalt(10,(err,salt)=>{
        if(err) return next(err);

        bcrypt.hash(user.password,salt,null,(err,hash)=>{
            if(err) return next(err);
            user.password = hash;
            next();
        })
    })
});

UserSchema.methods.comparePassword = function (candiadatePassword) {
    if(this.password != null){
        return bcrypt.compareSync(candiadatePassword,this.password);
    }
    else {
        return false;
    }
};


// UserSchema.methods.comparePassword = (password)=>{
//     return bcrypt.compareSync(password,this.password);
// };


module.exports = mongoose.model('User',UserSchema);