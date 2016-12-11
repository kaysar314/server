
// var app = require('express')();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var drawUsers = [];
var tayar = [];
var sozs = ['istakan','janim','awmaydi','kazakh','yman','batir','abay','sarimay','kaskir'];

var kazirSoz = '';
var kazirSizwxi = null;
var turaSan = 0;

app.use(express.static(__dirname+'/public'));

io.on('connection',function(socket){
	console.log('a user connected');

	socket.on('getin',function(user){
		drawUsers.push({socketid:socket.id,usr:user});
		socket.join('room1');

		// if(drawUsers.length == 1){
			// socket.emit('getin', true);
		// }
		io.sockets.in('room1').emit('getinAll', drawUsers);
		
		console.log('user getin');
	})

	socket.on('path',function(path){
		io.sockets.in('room1').emit('path', path);
		console.log('user path');
	})

	socket.on('sendWord',function(word){
		if(word.word == kazirSoz && word.word != ''){
			word.word = word.name+' tura aytti~~';
			io.sockets.in('room1').emit('nomirkosw', [{id:word.id,kos:2-turaSan+1},{id:kazirSizwxi,kos:1}]);
			if(turaSan<2){
				turaSan++;
			}
		}
		io.sockets.in('room1').emit('getWord', word);
		console.log('user sendWord: '+word.word);
	})

	socket.on('disconnect',function(){

		console.log(socket.id.toString());
		for (var i = 0; i < drawUsers.length; i++) {
			if(drawUsers[i].socketid === socket.id){
				io.sockets.in('room1').emit('out', drawUsers[i]);
				drawUsers.splice(i,1);
				break;
			}
		}
		// io.sockets.in('room1').emit('getWord', word);
	})

	socket.on('tayarjoyw',function(user){
		for(var i = 0; i < tayar.length; i++){
			if(tayar[i].id == user.id){
				tayar.splice(i,1);
				io.sockets.in('room1').emit('tayarjoyw', user);
				break;
			}
		}
	})

	socket.on('tayar',function(user){

		tayar.push(user);
		io.sockets.in('room1').emit('tayar', user);
		console.log('user tayar');

		if (tayar.length == drawUsers.length){
			x = -1;
			turaSan = 0;

			countSizw();

			function countSizw(){
				if (x<drawUsers.length*2-1){
					x++;
					kazirSizwxi = drawUsers[x%2].usr.id;
					kazirSoz = sozs[x];
					io.sockets.in('room1').emit('sizwBasta', {drawer:drawUsers[x%2].usr.id,soz:sozs[x],sozEskert:'kazakhxa'});
					setTimeout(sizwBitw,60000);
					setTimeout(countSizw,64000);
				}
			}

			function sizwBitw(){
				if (x>=drawUsers.length*2-1){
					tayar = []
					io.sockets.in('room1').emit('sizwBitw', {});
				}
				kazirSoz = '';
				turaSan = 0;
				kazirSizwxi = null;
				io.sockets.in('room1').emit('birSizwBitw', {soz:sozs[x]});
			}
		}
	})
});

http.listen(4000, function(){
  console.log('listening on *:4000');
});