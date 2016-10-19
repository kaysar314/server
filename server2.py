import threading, socket, time, json
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('139.129.59.141', 9999))

tempData = {"0" : [], "1" : []}
state = {"0" : None, "1" : None}

s.listen(5)
print('waiting for connection...')

STATE_LOSE = 0
STATE_WIN = 1
GET_STATE = 2

def tcplink(sock, addr):
	print('Accept new connection from %s:%s...' % addr)
	threadName = threading.current_thread().name
	while True:
		data = sock.recv(1024)
		print(data.decode('utf-8'))
		fuckData = json.loads(data.decode('utf-8'))

		if fuckData == 'exit':
			break

		elif fuckData == 'need':
			if len(tempData[threadName]) > 0:
				print(tempData[threadName])
				sock.send(json.dumps(tempData[threadName]).encode('utf-8') + '\n'.encode('utf-8'))
				while len(tempData[threadName]) > 0:
					tempData[threadName].pop()
			else:
				sock.send(b'no\n')

		elif fuckData == 'lose':
			if threadName == '0':
				state["1"] = 1
			else:
				state["0"] = 1
			sock.send('ack\n'.encode('utf-8'))

		elif fuckData == 'win':
			if threadName == '0':
				state["1"] = 0
			else:
				state["0"] = 0
			sock.send('ack\n'.encode('utf-8'))

		elif fuckData == 'getstate':
			sock.send(json.dumps(state[threadName]).encode('utf-8') + '\n'.encode('utf-8'))

		else:
			if threadName == '1':
				tempData["0"].append(fuckData)
				sock.send(b'ack\n')
			else:
				tempData["1"].append(fuckData)
				sock.send(b'ack\n')	
		print("0", state["0"])
		print("1", state["1"])
		#print("0", tempData["0"])
		#print("1", tempData["1"])
	sock.close()
	print('Connection from %s:%s closed.' % addr)

num = 0
while True:
	sock, addr = s.accept()
	t = threading.Thread(target = tcplink, args = (sock, addr), name = str(num))
	num = num ^ 1
	t.start()
