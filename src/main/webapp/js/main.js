let ws = null;

function newRoom(){

    if (ws != null) {
        ws.close();
    }
    // calling the ChatServlet to retrieve a new room ID
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?add=true";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())  // returns a string in JSON format with fields roomList and roomId
        .then(response => JSON.parse(response))
        .then(response => {
            listParser(response.roomList);
            enterRoom(response.roomId);
        }); // enter the room with the code
}

function refreshList(){
    // calling the ChatServlet to retrieve list of room names
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?add=false";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.text())
        .then(response => listParser(response)); // parse the json with room names
}

//parses our list of rooms when we refresh
function listParser(json){
    //parsing json
    let codeList = JSON.parse(json).roomList
    //clearing current table to avoid dupicating rooms
    document.getElementById("Rooms").innerHTML = "<tbody></tbody>";

    //add each room name to a new row of our table
    let table = document.getElementById("Rooms").getElementsByTagName('tbody')[0];
    for(let i = 0; i < codeList.length; i++) {
        table.insertAdjacentHTML("beforeend",
            " <h3 class=\"d-1\" type=\"button\" onclick=\"enterRoom('"+ codeList[i] +"')\">"+ codeList[i] +"</h3>")
    }
}

//used for sending timestamps with chat messages
function timestamp() {
    var d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}

function enterRoom(code){
    refreshList()
    document.getElementById("log").value = "";
    //avoids multiple open sockets
    if (ws != null) {
        ws.close();
    }

    // create the websocket
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/"+code);

    document.getElementById("RoomTitle").innerHTML = "You are currently in Room " + code;

    // parse messages received from the server and update the UI accordingly
    ws.onmessage = function (event) {
        console.log(event.data);
        // parsing the server's message as json
        let message = JSON.parse(event.data);
        document.getElementById("log").value += "(" + timestamp() + ") " + message.message + "\n";
        }
}

//sends message over websocket on enter
document.getElementById("input").addEventListener("keyup", function (event) {
    refreshList()
    if (event.keyCode === 13) {
        let request = {"message":event.target.value};
        ws.send(JSON.stringify(request));
        event.target.value = "";
    }
});

(function (){
    refreshList();
})();