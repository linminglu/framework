var roomMgr = require('./roommgr');
var userList = {};
var userOnline = 0;
exports.bind = function(userId,socket){
    userList[userId] = socket;
    userOnline++;
};

exports.del = function(userId,socket){
    console.log('usermgr del',userId);
    delete userList[userId];
    userOnline--;
};

exports.get = function(userId){
    return userList[userId];
};

exports.isOnline = function(userId){
    var data = userList[userId];
    if(data != null){
        return true;
    }
    return false;
};

exports.getOnlineCount = function(){
    return userOnline;
}

exports.sendMsg = function(userId,event,msgdata){
    var userInfo = userList[userId];
    if(userInfo == null){
        return;
    }
    var socket = userInfo;
    if(socket == null){
        return;
    }
    console.log(userId);
    console.log(event);
    // if(event == 'game_action_push'){
    //     console.log('before emit');
    // }

    socket.emit(event,msgdata);

    // if(event == 'game_action_push'){
    //     console.log('end emit');
    // }
};

exports.kickAllInRoom = function(roomId){
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    for(var i = 0; i < roomInfo.seats.length; ++i){
        var rs = roomInfo.seats[i];

        //如果不需要发给发送方，则跳过
        if(rs.userId > 0){
            var socket = userList[rs.userId];
            if(socket != null){
                exports.del(rs.userId);
                socket.disconnect();
            }
        }
    }
};

exports.broacastInRoom = function(event,data,sender,includingSender){
    var roomId = roomMgr.getUserRoom(sender);
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }
    console.log('sender:',sender);
    console.log('event:',event);
    for(var i = 0; i < roomInfo.seats.length; ++i){
        var rs = roomInfo.seats[i];

        //如果不需要发给发送方，则跳过
        if(rs.userId == sender && includingSender != true){
            continue;
        }
        var socket = userList[rs.userId];
        if(socket != null){
            socket.emit(event,data);
        }
    }
};