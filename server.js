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
const PORT = 443;
const conn = {  // mysql 접속 설정
   host: process.env.DB_HOST,
   port: '3306',
   user: process.env.DB_USER,
   password: process.env.DB_PASS,
   database: 'wow_town',
   insecureAuth : true
};  

var countMysqlUpdate=0;
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
      let IsSameCode;
      console.log('[INFO] JOIN received !!! ');
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
            sogaeT:"",
            email:data.name,
            gwansimsa1:"cpp",
            gwansimsa2:"cpp",
            gwansimsa3:"cpp",
            islogged:false,
            costume:""
            };//new user  in clients list
            currentUser.code=data.code
            let connection = mysql.createConnection(conn); // DB 커넥션 생성
            connection.connect();   // DB 접속
            
            let sql = "SELECT distinct avatar.id,invite_code, avatar.nick_name,type,description,costume_idx FROM avatar join user join avatar_interest on user.id=avatar.user_id and avatar_interest.avatar_id=avatar.id  where user.email="+"'"+data.name+"'";
            connection.query(sql, function (err, results, fields) {
               if (err) {
                  console.log(err);
               }
               let recv=results[0];
               let recv1=results[1];
               let recv2=results[2];
               
               if(typeof recv == "undefined" || recv == null || recv == "" ||recv.invite_code != currentUser.code){
                  return 0;
               }
               currentUser.islogged=true;
               currentUser.userid=String(results[0].id);
               console.log(recv.user_id);
               currentUser.name=recv.nick_name;
               currentUser.costume=String(results[0].costume_idx);
               socket.emit("LOGIN_SUCCESS",currentUser.id,currentUser.name,currentUser.position,currentUser.userid,currentUser.costume);
               console.log('[INFO] player '+currentUser.name+': logged!');
               console.log('[INFO] currentUser.position '+currentUser.position);   
               console.log('[INFO] currentUser.code '+currentUser.code);
               console.log('[INFO] currentUser.code '+currentUser.costume);
               

               
               currentUser.gwansimsa1=results[0].type;
               currentUser.gwansimsa2=results[1].type;
               currentUser.gwansimsa3=results[2].type;
               currentUser.sogaeT=results[0].description;
               console.log(currentUser.userid);
               console.log(typeof(currentUser.userid));

               
               console.log(currentUser.sogaeT);
               console.log(currentUser.gwansimsa1);
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
                  socket.emit('SPAWN_PLAYER',i.id,i.name,i.position,i.gwansimsa1,i.gwansimsa2,i.gwansimsa3,i.sogaeT,i.userid,i.costume);
                  
                  }//END_IF
            
               });//end_forEach
               
               // spawn currentUser client on clients in broadcast
               socket.broadcast.emit('SPAWN_PLAYER',currentUser.id,currentUser.name,currentUser.position,currentUser.gwansimsa1,currentUser.gwansimsa2,currentUser.gwansimsa3,currentUser.sogaeT,currentUser.userid,currentUser.costume);
            
            });
            connection.end();
            console.log(currentUser.name);
            console.log(currentUser.userid);
            console.log('end');
            
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

   socket.on('SENDMSG',function(data){
      var data=JSON.parse(data);
      console.log(data.local_player_id);
      console.log(data.msg);
      console.log(currentUser.id);
      socket.broadcast.emit('RECVMSG',data.local_player_id,data.msg);
   })

   socket.on('ADD_FRIEND',function(_data){
      var data=JSON.parse(_data);
      var date;
      date = new Date();
      date = date.getUTCFullYear() + '-' +
         ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
         ('00' + date.getUTCDate()).slice(-2) + ' ' + 
         ('00' + date.getUTCHours()).slice(-2) + ':' + 
         ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
         ('00' + date.getUTCSeconds()).slice(-2);
      console.log(date);
      if (currentUser){
      
         var connection = mysql.createConnection(conn); // DB 커넥션 생성
         var connection1= mysql.createConnection(conn);
         let sql1='select avatar_id, friend_id from avatar_friend where avatar_id='+'"'+data.added+'" and friend_id='+'"'+data.userid+'"';
         console.log(sql1);
         connection.connect();   // DB 접속
         connection.query(sql1, function (err, results, fields) {
            if (err) {
               console.log(err);
            }
            if(typeof results== "undefined" || results == null || results == ""){
               connection1.connect();
               let sql = 'INSERT into avatar_friend(avatar_friend_status, avatar_id,friend_id,create_at) values("REQUESTED",'+'"'+data.added+'"'+","+'"'+data.userid+'",'+'"'+date+'")';
               connection1.query(sql, function (err, results, fields) {
                  if (err) {
                     console.log(err);
                  }
               });
               connection1.end();
            connection.end();
            }
         });
      }
   });


});//END_IO.ON


https.listen(PORT, function(){
   console.log('listening on *:'+PORT);
});
console.log("------- server is running -------");
setInterval(() => {
   
   var connection2 = mysql.createConnection(conn);
   var connection3= mysql.createConnection(conn);
   let sql='select cntupdate from avatar_change_log where id=1';
   console.log(sql);
   connection2.connect()
   connection2.query(sql,function(err,results,fields){
      if(err) {
         console.log(err);
         return 0;
      }
      console.log(results[0].cntupdate);
      if(results[0].cntupdate != countMysqlUpdate){
         countMysqlUpdate=results[0].cntupdate;
         let sql1='select distinct nick_name,costume_idx,avatar_id,type,description from avatar,avatar_interest where avatar.id=avatar_id';
            console.log(sql1);
            connection3.connect()
            connection3.query(sql1,function(err,results,fields){
               if(err){
                  console.log(err);
                  return 0;
               }
               clients.forEach(function(j){
                  var count=0;
                  results.forEach(function(i){
                     if(i.avatar_id==j.userid){
                        if(count==0){
                           j.gwansimsa1=i.type;
                           j.nickname=i.nick_name;
                           j.costume=i.costume_idx;
                           j.sogaeT=i.description;
                           console.log(j.gwansimsa1);
                        }
                        else if(count==1){
                           j.gwansimsa2=i.type;
                           console.log(j.gwansimsa2);
                        }
                        else{
                           j.gwansimsa3=i.type;
                           console.log(j.gwansimsa3);
                        }
                        count+=1;
                     }
                  });
               });
               clients.forEach( function(k) {
                  io.emit('UPDATE_INFO',k.id,k.gwansimsa1,k.gwansimsa2,k.gwansimsa3,k.costume,k.nickname,k.sogaeT);
                  console.log(k.costume);
                  console.log(k.gwansimsa1);
                  console.log(k.gwansimsa2);
                  console.log(k.gwansimsa3);
            })
            connection3.end();
         });//end_forEach
      }   
   })
   connection2.end();
}, 10000);