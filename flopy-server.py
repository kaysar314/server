#!/usr/bin/env python    
#encoding: utf-8  
import simplejson
import socket, threading  
from time import ctime  
from random import Random

player = {}
foods = {}
data = {}

pastOps = {}

sockets = {}
rooms = {}

pos = [[0,0],[-1100,300],[1300,300],[-1100,800],[1300,800],[-1100,-300],[1300,-300]]
playerPos = {}

addNew = ["false"]

SERVER = '127.0.0.1'
PORT = 8080
MAXTHREADS = 20
RECVBUFLEN = 1024

class ComunicateServer(threading.Thread):
    def __init__(self, clientsocket, address, num, socketId):
        
        threading.Thread.__init__(self)
        self.socket = clientsocket
        self.num = num
        self.id = socketId
        self.address = address

        if self.num <= 1:
            rooms["room1"] = []

        rooms["room1"].append(self.id)
        

        print 'New thread [%d] started!' % self.num

    def run(self):
        while True:
            try:
                d = self.socket.recv(1024)
                dic = simplejson.loads(d)
            except:
                break

            if dic.get("get_in") != None:
            
                print '[get_in] From clint side: '+dic['get_in']+str(self.num)+' '+self.id

                if self.id not in player:
                        sockets[self.id].send(simplejson.dumps({"get in":{"id":self.id,"pos":pos[self.num]},"create floppy":playerPos})+'\n')
                        player[self.id] = {}
                        player[self.id]["ready"] = False
                        playerPos[self.id] = pos[self.num]
                        pastOps[self.id] = []

                for s in rooms["room1"]:
                    print "send "+s
                    sockets[s].send(simplejson.dumps({"create floppy":playerPos})+'\n')

            if dic.get("ready") != None:
            
                print '[ready] From clint side: '+self.id

                player[self.id]["ready"] = True

                judge = True
                for p in player:
                    if not player[p]["ready"]:
                        judge = False
                        break

                if judge:
                    for s in rooms["room1"]:
                        sockets[s].send(simplejson.dumps({"ready":dic['ready'],"start":""})+'\n')
                else:
                    for s in rooms["room1"]:
                        sockets[s].send(simplejson.dumps({"ready":dic['ready']})+'\n')

            if dic.get("not_ready") != None:
            
                print '[not_ready] From clint side: '+self.id
                
                for s in rooms["room1"]:
                    sockets[s].send(simplejson.dumps({"not ready":dic['not_ready']})+'\n')
            
            if dic.get("control_floppy") != None:
            
                print '[control_floppy] From clint side => id: '+dic['control_floppy']["id"]+" frame: "+str(dic['control_floppy']["frameId"])

                pastOps[dic['control_floppy']["id"]].append(dic['control_floppy'])
                if len(pastOps[dic['control_floppy']["id"]])>5:
                    del pastOps[dic['control_floppy']["id"]][0];
                
                for s in rooms["room1"]:
                    sockets[s].send(simplejson.dumps({"control floppy":{"id":dic['control_floppy']["id"],"data":pastOps[dic['control_floppy']["id"]]}})+'\n')

class ListenServer(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.socket = None
        print 'Start Listen....'

    def run(self):
        def random_str(randomlength=8):
            str = ''
            chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'
            length = len(chars) - 1
            random = Random()
            for i in range(randomlength):
                str+=chars[random.randint(0, length)]
            return str

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  
        self.socket.bind((SERVER,PORT))  
        self.socket.listen(2)  
        num = 1  
        while True:  
            cs,address = self.socket.accept()
            socketId = random_str()
            sockets[socketId] = cs
            comser = ComunicateServer(cs, address, num, socketId)  
            comser.start()
            num += 1
            print 'Listen Next...'  
        self.socket.close()
  
if __name__ == '__main__':  
    asvr = ListenServer()  
    asvr.start()  
    asvr.join() 

