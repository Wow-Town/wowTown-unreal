const fs = require('fs');

const options = {
  key: fs.readFileSync('./private.pem'),
  cert: fs.readFileSync('./public.pem')
};
var express  = require('express');//import express NodeJS framework module
require('dotenv').config();
var app      = express();// create an object of the express module
var https     = require('https').Server(options,app);// create a http web server using the http library
var io       = require('socket.io')(https, { cors: { origin: "*" } });// import socketio communication module
const mysql = require('mysql');
const cors = require('cors');
const createApplication = require('express/lib/express');
const { timeStamp } = require('console');
const PORT = 3001;
const conn = {  // mysql 접속 설정
   host: '13.125.41.115',
   port: '3306',
   user: 'root',
   password: 'wowTown123',
   database: 'wow_town',
   insecureAuth : true
};  

app.use("/public/TemplateData",express.static(__dirname + "/public/TemplateData"));
app.use("/public/Build",express.static(__dirname + "/public/Build"));
app.use(express.static(__dirname+'/public'));
app.use(cors());

var clients         = [];// to storage clients
var clientLookup = {};// clients search engine
var sockets = {};//// to storage sockets


//open a connection with the specific client
io.on('connection', function(socket){

   //print a log in node.js command prompt
   console.log('A user ready for connection!');

   //to store current client connection
   var currentUser;
      
      
   //create a callback fuction to listening EmitPing() method in NetworkMannager.cs unity script
   socket.on('PING', function (_pack)
   {
   //console.log('_pack# '+_pack);
   var pack = JSON.parse(_pack);   

      console.log('message from user# '+socket.id+": "+pack.msg);
      
      //emit back to NetworkManager in Unity by client.js script
      socket.emit('PONG', socket.id,pack.msg);
      
   });
      
   

   //create a callback fuction to listening EmitJoin() method in NetworkMannager.cs unity script
   socket.on('LOGIN', function (_data)
   {
      // const db = async() =>{
      //    let connection = await mysql.createConnection(conn); // DB 커넥션 생성
      //    connection.connect();   // DB 접속
      
      //    let sql = "SELECT nick_name FROM avatar where avatar.id = 3";
         
         
      //  connection.query(sql, function (err, results, fields) {
      //    if (err) {
      //       console.log(err);
      //    }
      //    let recv=results[0];
      //    console.log(recv.nick_name);
      //    IsSameCode=currentUser.code === recv.nick_name;
      //    //console.log(IsSameCode);
      // });
      // connection.end();
      // }
      let IsSameCode;
      console.log('[INFO] JOIN received !!! ');
      console.log(process.env.DB_AD);
      var data = JSON.parse(_data);

      // fills out with the information emitted by the player in the unity
      currentUser = {
            name:data.name,
            code:data.code,
            position:data.position,
            rotation:'0',
            id:socket.id,//alternatively we could use socket.id
            socketID:socket.id,//fills out with the id of the socket that was open
            animation:"",
            userid:"",
            email:data.name,
            gwansimsa1:"cpp",
            gwansimsa2:"cpp",
            gwansimsa3:"cpp",
            isMute:false
            };//new user  in clients list


            let connection = mysql.createConnection(conn); // DB 커넥션 생성
            connection.connect();   // DB 접속
            
            let sql = "SELECT avatar.id, avatar.nick_name FROM avatar join user on user.id=avatar.user_id where user.email ="+"'"+data.name+"'";
            console.log(sql);
            console.log(data.email);
            connection.query(sql, function (err, results, fields) {
               if (err) {
                  console.log(err);
               }
               let recv=results[0];
               if(typeof recv == "undefined" || recv == null || recv == ""){
                  return 0;
               }
              
               console.log(recv.user_id);
               currentUser.user_id=recv.user_id;
               currentUser.name=recv.nick_name;
               socket.emit("LOGIN_SUCCESS",currentUser.id,currentUser.name,currentUser.position);
               console.log('[INFO] player '+currentUser.name+': logged!');
               console.log('[INFO] currentUser.position '+currentUser.position);   
               console.log('[INFO] currentUser.code '+currentUser.code);

               

               //add currentUser in clients list
               clients.push(currentUser);
                  
               //add client in search engine
               clientLookup[currentUser.id] = currentUser;
               
               sockets[currentUser.id] = socket;//add curent user socket
               
               console.log('[INFO] Total players: ' + clients.length);
               
               /*********************************************************************************************/   
               
               //spawn playrs
               clients.forEach( function(i) {
                  if(i.id!=currentUser.id)
                  { 
                  //send to the client.js script
                  socket.emit('SPAWN_PLAYER',i.id,i.name,i.position,i.code,i.gwansimsa1,i.gwansimsa2,i.gwansimsa3,i.avatarid);
                  
                  }//END_IF
            
               });//end_forEach
               
               // spawn currentUser client on clients in broadcast
               socket.broadcast.emit('SPAWN_PLAYER',currentUser.id,currentUser.name,currentUser.position,currentUser.code,currentUser.gwansimsa1,currentUser.gwansimsa2,currentUser.gwansimsa3,currentUser.avatarid);
            });
            connection.end();
            
   });//END_SOCKET_ON
      
      
      

      
         
   //create a callback fuction to listening EmitMoveAndRotate() method in NetworkMannager.cs unity script
   socket.on('MOVE_AND_ROTATE', function (_data)
   {
   var data = JSON.parse(_data);   

   if(currentUser)
   {

   currentUser.position = data.position;

   currentUser.rotation = data.rotation;

   // send current user position and  rotation in broadcast to all clients in game
   socket.broadcast.emit('UPDATE_MOVE_AND_ROTATE', currentUser.id,currentUser.position,currentUser.rotation);


   }
   });//END_SOCKET_ON
      
   //    socket.on("VOICE", function (data) {


   // if(currentUser)
   // {
      

   //    var newData = data.split(";");
   //    newData[0] = "data:audio/ogg;";
   //    newData = newData[0] + newData[1];

      
   //    clients.forEach(function(u) {
      
   //    if(sockets[u.id]&&u.id!= currentUser.id&&!u.isMute)
   //    {
      
   //       sockets[u.id].emit('UPDATE_VOICE',newData);
   //    }
   //    });
      
      

   // }

   // });

   // socket.on("AUDIO_MUTE", function (data) {


   // if(currentUser)
   // {
   // currentUser.isMute = !currentUser.isMute;

   // }

   // });

   socket.on('ANIMATION', function (_data)
      {
      var data = JSON.parse(_data);   
      
      if(currentUser)
      {
      
      currentUser.timeOut = 0;
      
         //send to the client.js script
      //updates the animation of the player for the other game clients
      socket.broadcast.emit('UPDATE_PLAYER_ANIMATOR', currentUser.id,data.animation);
      
      
      }//END_IF
      
   });//END_SOCKET_ON
      

   // called when the user desconnect
   socket.on('disconnect', function ()
   {

      if(currentUser)
      {
      currentUser.isDead = true;
      
      //send to the client.js script
      //updates the currentUser disconnection for all players in game
      socket.broadcast.emit('USER_DISCONNECTED', currentUser.id);
      
      
      for (var i = 0; i < clients.length; i++)
      {
         if (clients[i].name == currentUser.name && clients[i].id == currentUser.id) 
         {

            console.log("User "+clients[i].name+" has disconnected");
            clients.splice(i,1);

         };
      };
      
      }
      
   });//END_SOCKET_ON

   socket.on('ADD_FRIEND',function(_data){
      const db = async() =>{
         let connection = await mysql.createConnection(conn); // DB 커넥션 생성
         connection.connect();   // DB 접속
      
         let sql = "INSERT into AVATAR_FRIEND(AVATAR_FRINED_STATUS, AVATAR_ID,FRIND_ID,CREATE_AT) values(REQUESTED,"+avatarid+","+Added+","+timeStamp+")";
         
         
         connection.query(sql, function (err, results, fields) {
         if (err) {
            console.log(err);
         }
         let recv=results[0];
         console.log(recv.nick_name);
         IsSameCode=currentUser.code === recv.nick_name;
            //console.log(IsSameCode);
      });
      connection.end();
      }
   
   })
   
});//END_IO.ON


https.listen(PORT, function(){
   console.log('listening on *:'+PORT);
});
console.log("------- server is running -------");