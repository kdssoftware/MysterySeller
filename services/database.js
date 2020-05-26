var shortid = require('shortid');
var items = require('./items');
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
        vip:user,
        busy:false,
        currentlyPlaying:null,
        playedRounds:0, //after first round, playedRounds = 1, ...
        items:this.getRandomItems(data.amount)
    };
    rooms.push(newRoom);
    return newRoom;
};

exports.editRoom = (roomId,newData) => {
    let indexOfRoom = this.getRoomIndex(roomId);
    let roomData = this.getRoomData(roomId);
    rooms[indexOfRoom].name = (newData.name)?newData.name:roomData.name;
    rooms[indexOfRoom].description = (newData.description)?newData.description:roomData.description;
    rooms[indexOfRoom].busy = (newData.busy)?newData.busy:roomData.busy;
    rooms[indexOfRoom].currentlyPlaying = (newData.currentlyPlaying)?newData.currentlyPlaying:roomData.currentlyPlaying;
    if(newData.users){ //if users need editing (updating)
        let currentListedUserIndex = 0;
        newData.users.forEach((u)=>{ //update all users listed
            let currentEditUserIndex = 0;
           rooms[indexOfRoom].users.forEach((ru)=>{ //find the users currently in loop
                if(u.id===ru.id){//user found in room
                    rooms[indexOfRoom].users[currentEditUserIndex].name = (newData.users[currentListedUserIndex].name)?newData.users[currentListedUserIndex].name:ru.name;
                    rooms[indexOfRoom].users[currentEditUserIndex].plays = (newData.users[currentListedUserIndex].plays)?newData.users[currentListedUserIndex].plays:ru.plays;
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
    if(rooms[indexOfRoom].busy){
        //room is busy;
        return null;
    }else{
        rooms[indexOfRoom].users.push(user);
    }

    return roomId;
};

exports.leaveRoom = (user,roomId) => {
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

exports.startRoom = (user,roomId) => {
    console.log("current player is: ",user);
    this.editRoom(roomId,{busy:true,currentlyPlaying:{user},users:[{name:user.name,id:user.id,plays:1}]});
};
exports.stopRoom = (roomId) => {
    this.editRoom(roomId,{busy:false,currentlyPlaying:null});
};
exports.chooseNextPlayer = (user,roomId) =>{
    this.editRoom(roomId,{currentlyPlaying:{user}});
};
exports.nextPlayer = (roomId)=>{
    let roomIndex = this.getRoomIndex(roomId);
    //adds 1 to plays of the next player
    //next player is now currentlyPlaying
    let indexOfUser = 0;
    let playerFound = false;
    rooms[roomIndex].users.forEach((u)=>{
       if(u.plays===rooms[roomIndex].playedRounds){
           console.log('current player is:',u);
           rooms[roomIndex].currentlyPlaying.user = u;
           rooms[roomIndex].users[indexOfUser].plays++;
           playerFound = true;
       }
       indexOfUser++;
    });
    if(!playerFound){//next round, 1 first player in list now playing
        console.log('starting next round');
        console.log('current player is:',rooms[roomIndex].users[0]);
        rooms[roomIndex].playedRounds++;
        rooms[roomIndex].users[0].plays++;
        rooms[roomIndex].currentlyPlaying.user = rooms[roomIndex].users[0];
    }
};
exports.getCurrentPlayer = (roomId) =>{
    return rooms[this.getRoomIndex(roomId)].currentlyPlaying.user;
};

exports.getRandomItems =(amount)=>{
    let itemsCopy = items;
    let itemsChosen = [];
    while(amount!==0){
        let itemIndex = Math.floor((Math.random() * itemsCopy.length));
        let item = itemsCopy[itemIndex];
        itemsCopy.splice(itemIndex,1);
        itemsChosen.push(item);
        amount--;
    }
    return itemsChosen;
};

exports.removeFirstItem = (roomId)=>{
    let roomIndex = this.getRoomIndex(roomId);
    if(rooms[roomIndex].items.length>=0){
        return rooms[roomIndex].items.splice(0,1);
    }else{
        return null;
    }
};

exports.getFirstItem = (roomId) =>{
    if(rooms[this.getRoomIndex(roomId)].items.length===0){
     return null;
    }else{
        return rooms[this.getRoomIndex(roomId)].items[0];
    }
};
