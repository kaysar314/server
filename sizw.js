
// var app = require('express')();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = {};
var tayar = {};
var rounds = {};
var wakit = {};
var paths = {};

var sozs = ['istakan','janim','awmaydi','kazakh','yman','batir','abay','sarimay','kaskir'];

var kazirSoz = {};
var kazirSizwxi = {};
var turaSan = {};

app.use(express.static(__dirname+'/public'));

io.on('connection',function(socket){
	console.log('a user connected');

	socket.on('getin',function(user){
		// drawUsers.push({socketid:socket.id,usr:user});
		// socket.join('room1');

		socket.emit('getin', rooms);
		// io.sockets.in('room1').emit('getinAll', drawUsers);
		
		console.log('user getin');
	})

	socket.on('comeback',function(user){
		var rn = user.roomname;
		for(var i = 0; i < rooms[rn].drawers.length; i++){
			if(rooms[rn].drawers[i].id === user.id){
				rooms[rn].drawers[i].ixinde = true;
				socket.join(rn);
				socket.emit('enter room in game', {drawers:rooms[rn].drawers,paths:paths[rn],kzszxi:kazirSizwxi[rn],es:'kazakhxa',wakit:wakit[rn]});
				io.sockets.in(rn).emit('comeback', rooms[rn].drawers[i]);
			}
		}
		console.log('user comeback: '+user.id+', in room: '+rn);
	})

	socket.on('create room',function(room){
		// {roomName,language,pw,drawer} drawer{id,name}
		var rn = room.roomname;

		if(rooms[rn] != null){
			socket.emit('check room name','baska uy ati engiziniz');
			console.log('already has room: '+rn);	
		}else{

		rooms[rn]={til:room.til,pw:room.pw,basta:false,drawers:[]};
		tayar[rn]=[];
		rounds[rn] = {num:-1,total:0};
		kazirSoz[rn] = '';
		kazirSizwxi[rn] = '';
		wakit[rn] = 0;
		turaSan[rn] = 0;

		socket.join(rn);
		rooms[rn].drawers = [{id:room.drawer.id,name:room.drawer.name,socketid:socket.id,ixinde:true}];
		
		io.sockets.emit('update rooms add room', {rn:rn,rooms:rooms});

		io.sockets.in(rn).emit('enter room', rooms[rn].drawers);

		// io.sockets.emit('getin', rooms);
		
		console.log('user create room: '+rn);	

		}
	})

	socket.on('enter room',function(room){
		// {roomName,language,pw,drawers} drawers{userid,name}
		var rn = room.roomname;
		if(rooms[rn].pw === room.pw && rooms[rn].drawers.length <= 8){
			socket.join(rn);
			// romms[room.roomname].drawers['socketid'] = socket.id;
			rooms[rn].drawers.push({id:room.drawer.id,name:room.drawer.name,socketid:socket.id,ixinde:true});
			io.sockets.in(rn).emit('enter room', rooms[rn].drawers);
			io.sockets.emit('update rooms add player', {roomname:rn,drawers:rooms[rn].drawers});
		}else{
			socket.emit('katepw',room.roomname+"din nomiri kate!");
		}
		// socket.join(rn);
		// // romms[room.roomname].drawers['socketid'] = socket.id;
		// romms[rn].drawers.push({id:room.drawer.id,name:room.drawer.name,socketid:socket.id})
		// io.sockets.in(rn).emit('enter room', romms[rn].drawers);
		
		console.log('user getin room: '+rn);
	})

	socket.on('path',function(path){
		paths[path.roomname].push(path.path);
		io.sockets.in(path.roomname).emit('path', path.path);
		console.log('user path');
	})

	socket.on('sendWord',function(word){
		var rn = word.roomname;
		if(word.word == kazirSoz[rn] && word.word != ''){
			word.word = word.name+' tura aytti~~';
			io.sockets.in(rn).emit('nomirkosw', [{id:word.id,kos:2-Math.floor(turaSan[rn]/3)+1},{id:kazirSizwxi[rn],kos:1}]);
			turaSan[rn]++;
			var ixindeDrawerCount = 0;
			for(var ixi = 0; ixi<rooms[rn].drawers.length; ixi++){
				if(rooms[rn].drawers[ixi].ixinde){
					ixindeDrawerCount+=1;
				}
			}
			if(ixindeDrawerCount == turaSan[rn]+1){
				wakit[rn] = 0;
			}
		}
		io.sockets.in(word.roomname).emit('getWord', word);
		console.log('user sendWord: '+word.word);
	})

	socket.on('disconnect',function(){

		console.log(socket.id.toString());

		var hasdone = false;
		for (var k in rooms) {
			if(rooms[k] != null){

			var ixindeDrawerCount = 0;
			for(var i = 0; i < rooms[k].drawers.length; i++){

				if(rooms[k].drawers[i].socketid === socket.id){

					if(kazirSizwxi[k] === rooms[k].drawers[i].id){
						wakit[k] = -10;
					}

					socket.leave(k);

					if(rooms[k].basta){
						rooms[k].drawers[i].ixinde = false;
						io.sockets.in(k).emit('out in game', rooms[k].drawers[i]);

						for(var it = 0; it < tayar[k].length; it++){
							if(tayar[k][it].id == rooms[k].drawers[i].id){
								tayar[k].splice(it,1);
								break;
							}
						}

						console.log("a player out during the game, name: "+rooms[k].drawers[i].name);

					}else{
						io.sockets.in(k).emit('out in room', rooms[k].drawers[i]);
						
						rooms[k].drawers.splice(i,1);
						io.sockets.emit('update rooms delete player', {roomname:k,drawers:rooms[k].drawers});
					}
					
					hasdone = true;

				}
				
				if (rooms[k].drawers[i]!=null) {
					if(rooms[k].drawers[i].ixinde){
						ixindeDrawerCount+=1;
					}
				}
			}
			if (ixindeDrawerCount == 0) {
				delete rooms[k];
				delete tayar[k];

				io.sockets.emit('update rooms gone', {roomname:k});
			}

			}
			if(hasdone){break;}
		}
	})

	socket.on('tayarjoyw',function(user){
		for(var i = 0; i < tayar[user.roomname].length; i++){
			if(tayar[user.roomname][i].id == user.id){
				tayar[user.roomname].splice(i,1);
				io.sockets.in(user.roomname).emit('tayarjoyw', user);
				break;
			}
		}
	})

	socket.on('tayar',function(user){

		var rn = user.roomname;

		tayar[rn].push(user);
		io.sockets.in(rn).emit('tayar', user);

		var drawersSum = rooms[rn].drawers.length;

		console.log('user tayar: '+user.id+', in room: '+rn+' '+tayar[rn].length+'/'+rooms[rn].drawers.length);

		if (tayar[rn].length == drawersSum && tayar[rn].length>1){
			
			rooms[rn].basta = true;
			io.sockets.emit('update rooms basta', {roomname:rn,basta:true});

			turaSan[rn] = 0;
			rounds[rn].num = -1;
			rounds[rn].total = drawersSum*2;
			wakit[rn] = 60;

			sizwBasta();

			paths[rn] = [];

			function countSizwSec(){

				if(wakit[rn]>0){
					wakit[rn]-=2;
					setTimeout(countSizwSec,2000);
				}else {
					sizwBitw();
				}
			}

			function sizwBitw(){

				if(rooms[rn]!=null){
					var ixindeDrawerCount = 0;
					for(var ixi = 0; ixi<drawersSum; ixi++){
						if(rooms[rn].drawers[ixi].ixinde){
							ixindeDrawerCount+=1;
						}
					}
					console.log('one round end, there are users: '+ixindeDrawerCount);
					if (ixindeDrawerCount<2 || rounds[rn].num>=rounds[rn].total){

						io.sockets.in(rn).emit('sizwBitw', rooms[rn].drawers);

						tayar[rn]=[];
						rooms[rn].basta = false;
						
						for(var btix = 0; btix<rooms[rn].drawers.length; btix++){
							if(!rooms[rn].drawers[btix].ixinde){
								console.log('one game end, the player '+rooms[rn].drawers[btix].name+' not back, and will leave game.');
								io.sockets.in(rn).emit('out in room', rooms[rn].drawers[btix]);
								rooms[rn].drawers.splice(btix,1);
								io.sockets.emit('update rooms delete player', {roomname:rn,drawers:rooms[rn].drawers})
							}
						}
						console.log('there are player: '+rooms[rn].drawers.length);
						paths[rn] = [];
						io.sockets.emit('update rooms basta', {roomname:rn,basta:false,sum:rooms[rn].drawers.length});
						
					}else{
						kazirSoz[rn] = '';
						kazirSizwxi[rn] = '';
						wakit[rn] = 60;
						turaSan[rn] = 0;
						io.sockets.in(rn).emit('birSizwBitw', {soz:kazirSoz[rn]});
						setTimeout(sizwBasta,4000);
					}
				}
			}

			function sizwBasta(){
				paths[rn] = [];
				rounds[rn].num++;

				while(!rooms[rn].drawers[rounds[rn].num%drawersSum].ixinde){
					rounds[rn].num++;
					console.log('player '+rooms[rn].drawers[rounds[rn].num%drawersSum].name+' not here');
				}

				console.log('start round '+rounds[rn].num);
				if (rounds[rn].num < rounds[rn].total){
					kazirSizwxi[rn] = rooms[rn].drawers[rounds[rn].num%drawersSum].id;
					kazirSoz[rn] = sozs[rounds[rn].num];
					io.sockets.in(rn).emit('sizwBasta', {drawer:kazirSizwxi[rn],soz:kazirSoz[rn],sozEskert:'kazakhxa'});
					countSizwSec();
				}
				else{
					sizwBitw();
				}
			}
		}
	})
});

http.listen(4000, function(){
  console.log('listening on *:4000');
});