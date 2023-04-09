let ws;

function newRoom(){
    // calling the ChatServlet to retrieve a new room ID
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?add=true";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => enterRoom(JSON.parse(response).roomId)); // enter the room with the code
}

function refreshList(){
    // calling the ChatServlet to retrieve a new room ID
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?add=false";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.text())
        .then(response => listParser(response)); // enter the room with the code
}

function listParser(json){
    let codeList = JSON.parse(json).roomList
    let table = document.getElementById("Rooms").getElementsByTagName('tbody')[0];
    for(let i = 0; i < codeList.length; i++) {
        table.insertAdjacentHTML("beforeend",
            " <h3 class=\"d-1\" type=\"button\" onclick=\"enterRoom(' "+ codeList[i] +" ')\">"+ codeList[i] +"</h3>")

    }
}

function timestamp() {
    var d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}

function enterRoom(code){

    // refresh the list of rooms


    // create the web socket
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

// handle message
document.getElementById("input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        let request = {"message":event.target.value};
        ws.send(JSON.stringify(request));
        event.target.value = "";
    }
});