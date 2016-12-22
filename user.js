// mysql
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 100,
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'sozdik'
});

// var app = require('express')();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);



app.use(express.static(__dirname+'/public'));

io.on('connection',function(socket){
	console.log('a user connected');


	socket.on('login',function(user){
		
		var sql = 'select * from sozdik_user where sozdik_user.userName=? and sozdik_user.password=?';
		var values = [];
		
		console.log('username: '+user.userName);
		console.log('password: '+user.password);

		
		console.log(socket.id.toString());
		console.log(socket.request.toString());

		values.push(user.userName);
		values.push(user.password);

		pool.query({sql:sql,values:values},function(err, rows, fields){
			if (rows.length == 0){
				result = {isSucceed: false};
				socket.emit('login', result);
			}else{

				result = {isSucceed: true, id: rows[0].userid, email: rows[0].email};
				socket.emit('login', result);
			}
		})
	})

	socket.on('register',function(user){
		
		var sql = 'INSERT INTO sozdik_user(userName, password, email) VALUES(?,?,?)';
		var emailsql = 'select * from sozdik_user where sozdik_user.email=?'
		
		var values = [];
		var result = {};
		
		var email = [];

		values.push(user.userName);
		values.push(user.password);
		values.push(user.email);

		email.push(user.email);

		pool.query({sql:emailsql,values:email},function(err, rows, fields){
			if (rows.length == 0){
				console.log('not repeat email');
				pool.query({sql:sql,values:values},function(err, rlt){
					if(err){
         				console.log('[INSERT ERROR] - ', err.message);
						result = {isSucceed: false, error: err.message};
         				socket.emit('register', err.message);
        			}else{
						console.log('INSERT ID:', rlt);
						result = {isSucceed: true, id: rlt.insertId};
						socket.emit('register', result);
        			}
				})

			}else{
				console.log('email has been registered');
				result = {isSucceed: false, error: 'email'};
				socket.emit('register', result);
			}
		})
	})

	socket.on('sozizdew',function(soz){
		
		var sql = 'select * from kt2kz where kt2kz.kt=?';
		var values = [soz];

		pool.query({sql:sql,values:values},function(err, rows, fields){
			if (rows.length == 0){
				result = {isSucceed: false};
				socket.emit('sozizdew', result);
			}else{

				result = {isSucceed: true, sozder: rows};
				socket.emit('sozizdew', result);
			}
		})

		console.log('izdegen soz: '+soz);

		}
	})
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});