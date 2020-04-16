const express = require("express");
const User = require ('../models/user');
const auth = require('../middleware/auth');
const multer =require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail}= require('../emails/account');

const router = express.Router();

router.post('/users',async function(req,res){
    const user =new User(req.body)
    try{
       const resp= await user.save();
       sendWelcomeEmail(user.email,user.name)
       const token = await resp.generatAuthToken();
        res.status(200).send({resp,token})
    }catch(e){
     res.status(400).send(e);
       
   }
})

router.post("/users/login", async function(req,res){
    
    try{
        const user = await User.findByCredentials(req.body.email,req.body.passward);
        const token = await user.generatAuthToken();
        res.send({user:user,token});

    }catch(e){
        res.status(400).send(e);
    }
})

router.post('/users/logout',auth, async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
})

router.post('/users/logoutall',auth,async (req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
})



router.get('/users/me',auth,async function(req,res){
    res.send(req.user);

})

//we do not need thisa because that thing is done on above by the use of jwt token

// router.get('/users/:id',async function(req,res){
//     const _id = req.params.id;
//     try{
//         const results = await User.findById(_id);
//         if(!results){
//             res.status(404).send();
//         }
//         res.status(200).send(results)
//     }catch(e){
//         res.status(500).send(e);
//     }
// })

router.patch('/users/me',auth,async function(req,res){
    const updates =Object.keys(req.body);
    const allowedUpdate = ['age','name','email','passward'];
    const isvallidOpreration = updates.every((update)=>{
        return allowedUpdate.includes(update);
    })
    if(!isvallidOpreration){
        res.status(400).send({error : 'Invalid Updates!!'})
    }
    try{
        updates.forEach((update) => {

        req.user[update] =req.body[update];
    });
       console.log(req.body);
    await req.user.save();
     // const result = await User.findByIdAndUpdate(req.params.id, req.body, {new : true ,runValidators: true});
    res.status(200).send(req.user);

    }catch(e){
        
        res.status(500).send(e);

    }
    
})

router.delete('/users/me',auth,async function(req,res){
    try{
        await req.user.remove();
        //const result = await User.findByIdAndDelete(req.user._id);
        // if(!result){
        //     res.status(404).send();
        // }
        res.status(200).send(req.user);
    }catch(e){
        res.status(500).send(e)
    }
})

const uploads= multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
          return cb( new Error('please upload an image'));  

        }
        cb(undefined,true);
    }
})

router.post('/users/me/avtar',auth,uploads.single('avtar'),async(req,res)=>{
   // req.user.avatar=req.file.buffer;
   const buffer= await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
   req.user.avatar= buffer;
    await req.user.save()
    res.send();
//below error function need all four argument to write so that express know that this is the function to handle the error
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get("/users/id:/avtar",async(req,res)=>{
    console.log('here i m')
    try {
        const user= await User.findById(req.params.id)
    
        if(!user||!user.Avtar){
            throw new Error()
        }
    
        res.set('Content-Type','image/png')
        res.send(user.avtar)
        
    } catch (e) {
        res.status(404).send()
        
    }
    })

router.delete("/users/me/avtar",auth,async(req,res)=>{
    req.user.avatar=undefined;
    await req.user.save();
    res.send();
})


    module.exports = router;