const express = require("express");
const Task = require ('../models/task');
const auth = require('../middleware/auth');

const router = express.Router();

router.post("/tasks",auth,async function(req,res){
   // const task =new Task(req.body);
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try{
        const result = await task.save();
        res.status(200).send(result);

    }catch(e){
        res.status(400).send(e)
    }

})
//now Get req is like => /GET/tasks?completed=true
//Get/task?limit=10&skip=0
//GET/tasks?sortBy=createdAt:desc
router.get("/tasks",auth,async function(req,res){
    const match={};
    const sort={};


    if(req.query.completed){
        //but in req.query.completed vlue comes not boolean but in string form so we need to change it in boolean
        match.isCompleted = req.query.completed === "true"
    }
    if(req.query.sortBy){
        const part =req.query.sortBy.split(":");
        //use of ternary operater
        sort[part[0]] = part[1] ==='desc' ? -1 : 1
    }
    try{
        //const result = await Task.find({owner:req.user.id});
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
                
            }
        }).execPopulate();
        res.status(200).send(req.user.tasks);

    }catch(e){
        res.status(500).send(e);
    }
    
})

router.get("/tasks/:id",auth,async function(req,res){
    const _id = req.params.id;
    try{
      //  const result = await Task.findById(_id);
      const result = await Task.findOne({_id,owner:req.user.id});
        if(!result){
            res.status(404).send();
        }
        res.status(200).send(result);
    }catch(e){
        res.status(500).send(e);
    }

})

router.patch('/tasks/:id',auth,async function(req,res){
    const updates =Object.keys(req.body);
    const allowdUpdates =["isCompleted","description"];
    const isValidUpdate = updates.every((update)=>{
        return allowdUpdates.includes(update);
    })   
    if(!isValidUpdate){
        res.status(400).send({error :'Invalid updates !!'})
    } 
    try{
        //const result = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,isValidUpdate:true});
       // const result = await Task.findById(req.params.id);
       const result = await Task.findOne({_id:req.params.id,owner:req.user.id});

       if(!result){
        res.status(404).send();
    }
        updates.forEach((update) => {
            result[update]=req.body[updates];
        });
        await result.save();
        
        res.status(200).send(result);
    }catch(e){
        res.status(500).send(e)
            
    }
})
router.delete('/tasks/:id',auth,async function(req,res){
    try{
       // const result = await Task.findByIdAndDelete(req.params.id);
       const result = await Task.findOneAndDelete({_id:req.params.id,owner:req.user.id})
        if(!result){
            res.status(404).send();
        }
        res.status(200).send(result);
    }catch(e){
        res.status(500).send(e);
    }
})

    module.exports = router;