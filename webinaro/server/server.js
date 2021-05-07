/* global __dirname, process */

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const UserWebinar = require('./models/UserWebinar');
const Flow = require('./models/Flow');
const Webinar = require('./models/Webinar');
const WebinarMessage = require('./models/WebinarMessage');
const WebinarPool = require('./models/WebinarPool');
const UserDB = require('./models/User');

var mongoose = require("mongoose");
let ObjectId = mongoose.Types.ObjectId;

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

const dbConnect = require('./utils/mongoDbConnect');

const dbUrl = process.env.MONGO_DB_URL||"mongodb+srv://pwr:1QNJgHwqYH36CDs4@cluster0.0uihy.mongodb.net/todolist-mean?retryWrites=true&w=majority";
// console.log(dbUrl);
dbConnect.connect(dbUrl);


var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    // event listener: join
    socket.on('join', async (params, callback) => {
        if (!isRealString(params.u) || !isRealString(params.w)) {
            return callback('Sorry! Invalid webinar');
        }

        let userCheck = await UserWebinar.findOne({ userId: ObjectId(params.u) , webinarId:  ObjectId(params.w) });
        if(!userCheck){
            return callback('Sorry! Invalid webinar or You are not invited');
        }

        let userObj = await UserDB.findOne({_id: ObjectId(params.u)});
        let webinarObj = await Webinar.findOne({_id:  ObjectId(params.w) });
        let flowObj = await Flow.findOne({_id: webinarObj.flowId});

        socket.join(params.w); // user join the specific room
        users.removeUser(socket.id); // remove user from any other potential rooms
        users.addUser(socket.id, userObj.name, params.w, params.u); // add user to room user list

        io.to(params.w).emit('updateUserList', users.getUserList(params.w));
        
        socket.emit('webinarInfo', {webinarObj:webinarObj,flowObj:flowObj, upcomingWebinars: await getNext3Webinar()}); //server emit greeting message
        socket.emit('newMessage', generateMessage('Admin', userObj.name + ', Welcome to webinar!')); //server emit greeting message
        
        socket.broadcast.to(params.w).emit('newMessage', generateMessage('Admin', `${ userObj.name } has joined.`)); // server broadcast message inside of the room

        callback();
    });

    // event listener: createMessage
    socket.on('createMessage', async (message, callback) => {
        var user = users.getUser(socket.id);

        if(message.pool == true){
            await WebinarPool.create({
                userName: user.name,
                userId: ObjectId(user.userId),
                response: message.response,
                question: message.question,
                webinarId: ObjectId(user.room)
            });
        }

        else if(message.reg == true){
                await UserWebinar.create({
                    userId: ObjectId(user.userId),
                    webinarId: ObjectId(message.webinarId)
                })
        }

        else if (user && isRealString(message.text)) {
            await WebinarMessage.create({
                userName: user.name,
                userId: ObjectId(user.userId),
                message: message.text,
                webinarId: ObjectId(user.room)
            });
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }

        callback();
    });

    // event listener: createLocationMessage
    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${ user.name } has left.`));
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${ port }.`);
});

async function getNext3Webinar(){
    try{
    // 11am, 4PM, 9PM

    let webinarArr = await Webinar.find({startTime:{$gt: new Date()}});

    if(webinarArr.length >= 3){
        return webinarArr;
    }

    let createArr = [];
    let startTimeArr = []

    if(webinarArr.length > 0){
        let lastWebinar = webinarArr.pop();
        
        if(lastWebinar.startTime.getHours() == 15){
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(5).getTime()));
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(14).getTime()));
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(5).getTime()));  
        }
        else if(lastWebinar.startTime.getHours() == 20){
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(14).getTime()));
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(5).getTime()));
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(5).getTime()));   
        }
        else {
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(5).getTime()));
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(5).getTime()));
            startTimeArr.push(new Date(lastWebinar.startTime.addHours(14).getTime()));  
        }

        

        
    }
    else{
        var d = new Date();
        // add 5.30, 10+5 = 15
        d.setHours(15);
        d.setMinutes(30);
        d.setMilliseconds(0);

        console.log(new Date(),d);

        startTimeArr.push(new Date(d.addHours(0).getTime()));
        startTimeArr.push(new Date(d.addHours(5).getTime()));
        startTimeArr.push(new Date(d.addHours(14).getTime()));
        startTimeArr.push(new Date(d.addHours(5).getTime()));
        startTimeArr.push(new Date(d.addHours(5).getTime()));
        startTimeArr.push(new Date(d.addHours(14).getTime()));    
    }

    console.log(startTimeArr);

    for(let i = 0; i<startTimeArr.length;i++){
        createArr.push(
            { 
                "startTime" : startTimeArr[i],
                "duration" : 60, 
                "title" : "Cracking the Coding Interview", 
                "des" : "Are you looking for a software development engineer job in a MNC or in a Startup, which pays you 6 lakh or more per year. Then join my free workshop on, How you can crack a coding interview. Which is happening live on coming Sunday at 11:00 a.m. Do your registration now by clicking on the link provided inside the description. Hello friends, I am Rahul Lahoria. I am a geek, I started coding at age of 13. Founded my first company at age of 17. Did my Mtech in computer science from IIT Kharagpur. started working with the MNC known as capillary technology. After that I found IT company known as sadkon labs. I sold that company to live media. Work with livecheck as a CTO. Now co-founding a video tech startup known as Moge I/O",
                "speaker" : "Rahul Lahoria", 
                "flowId" : ObjectId("608430ffe1875ce4ff79037a") 
            }
        )

    }
    
    let t = await Webinar.create(createArr);
    console.log(t, createArr);

    return await Webinar.find({startTime:{$gt: new Date()}});
}
catch(e){
    console.log(e,e.message);
}

}

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
