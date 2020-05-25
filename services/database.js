var shortid = require('shortid');
rooms = [];

exports.createRoom = (user,data={}) => {
    //check if room id isnt in use
    let newRoomId = shortid.generate();
    if(this.getRoomData(newRoomId)){
        //room already exist
        throw "Room we created for you already exist, please try again";
        return null;
    }
    let newRoom = {
        id : newRoomId,
        name:data.name,
        description:data.description,
        users:[user],
        vip:user
    };
    rooms.push(newRoom);
    return newRoom;
};

exports.editRoom = (roomId,newData) => {
    let indexOfRoom = this.getRoomIndex(roomId);
    let roomData = this.getRoomData(roomId);
    rooms[indexOfRoom].name = (newData.name)?newData.name:roomData.name;
    rooms[indexOfRoom].description = (newData.description)?newData.description:roomData.description;
    if(newData.users){ //if users need editing (updating)
        let currentListedUserIndex = 0;
        newData.users.forEach((u)=>{ //update all users listed
            let currentEditUserIndex = 0;
           rooms[indexOfRoom].users.forEach((ru)=>{ //find the users currently in loop
                if(u.id===ru.id){//user found in room
                    rooms[indexOfRoom].users[currentEditUserIndex].name = newData.users[currentListedUserIndex].name;
                }else{
                    currentEditUserIndex++;
                }
           });
           currentListedUserIndex++;
        });
    }
    let newRoomData = this.getRoomData(roomId);
    return newRoomData;
};

exports.deleteRoom = (roomId) => {
    let indexOfRoom = 0;
    rooms.forEach((r)=>{
        if(r.id===roomId){
            return rooms.splice(indexOfRoom,1);
        }
        indexOfRoom++;
    });
    return null;
};

//If a room was found, receives the room data otherwise NULL
exports.getRoomData =  (roomId) => {

    let found = null;
    rooms.forEach((r) => {
        console.log(r);
       if (roomId == r.id){
           found = r;
       }
    });
    return found;
};

exports.getRoomIndex = (roomId) => {
    let indexOfRoom = 0;
    rooms.forEach((r)=>{
        if(r.id===roomId){
            return indexOfRoom;
        }
        indexOfRoom++;
    });
    return indexOfRoom;
};

exports.joinRoom = (user,roomId) => {
    let indexOfRoom = this.getRoomIndex(roomId);
    //check if user is already in room
    rooms[indexOfRoom].users.push(user);

    return roomId;
};

exports.leaveRoom = (user,roomId) => {
    console.log(user+' is leaving '+roomId);
    let indexOfRoom = this.getRoomIndex(roomId);
    let indexOfUser = 0;
    let thisRoom = rooms[indexOfRoom];
    thisRoom.users.forEach((u)=>{
        if(u.id === user.id){
            return thisRoom.users.splice(indexOfUser,1);
        }
        indexOfRoom++;
    });
    return null;
};
