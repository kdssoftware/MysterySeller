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
        users:[user]
    };
    rooms.push(newRoom);
    return newRoom;
};

exports.editRoom = (roomId,newData={}) => {
    let indexOfRoom = this.getRoomIndex(roomId);
    let roomData = this.getRoomData(roomId);
    rooms[indexOfRoom].name = (newData.name)?newData.name:roomData.name;
    rooms[indexOfRoom].description = (newData.description)?newData.description:roomData.description;
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
    console.log('getRoomData of '+roomId);
    let found = null;
    rooms.forEach((r) => {
        console.log(r);
       if (roomId == r.id){
           console.log("found room",r);
           found = r;
       }
    });
    return found;
};

exports.getRoomIndex = (roomId) => {
    let indexOfRoom = -1;
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
    rooms[indexOfRoom].users.push({user});
    console.log(rooms);
    return roomId;
};

exports.leaveRoom = (user,roomId) => {
    let indexOfRoom = this.getRoomIndex(roomId);
    let indexOfUser = 0;
    rooms[indexOfRoom].users.forEach((u)=>{
        if(u.id === user.id){
            return rooms[indexOfRoom].users.splice(indexOfUser,1);
        }
        indexOfRoom++;
    });
    return null;
};
