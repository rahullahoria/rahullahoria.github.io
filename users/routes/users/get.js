const User = require("../../models/User");


module.exports = {
    getById: (req,res, next)=>{

        Task.findById(req.params.id)
            .then(task=>{
                res.json({
                    status:{
                        message: "successfully",
                        code:200
                    },
                    data:task
                });
            }).catch(e=>{
                res.status(500).json({
                  status: {
                    message: e.message,
                    code: 500,
                  }
                });
              });
    
        
    
    },
    getAll : (req,res, next)=>{

        console.log(req.query);
        const pageSize = +req.query.pagesize;
        const currentPage = +req.query.currentpage;

        let queryObj= {};
        if(req.query.from && req.query.to){
            queryObj=  { //query today up to tonight
                createdAt: {
                    $gte: new Date(req.query.from), 
                    $lt: new Date(req.query.to)
                }
            }
        }
        const taskQuery = User.find(queryObj);

        if(pageSize && (currentPage > -1)){
            taskQuery
            .skip( pageSize * (currentPage) ) 
            .limit( pageSize )
        }

        taskQuery
            .then(async tasks=>{
                res.json({
                    status:{
                        message: "successfully",
                        code:200
                    },
                    data:tasks,
                    totalCount: tasks.length
                });
            }).catch(e=>{
                res.status(500).json({
                  status: {
                    message: e.message,
                    code: 500,
                  }
                });
              });
    
        
    
    }
}