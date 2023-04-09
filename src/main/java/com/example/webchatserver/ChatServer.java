package com.example.webchatserver;


import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * This class represents a web socket server, a new connection is created and it receives a roomID as a parameter
 * **/
@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {

    // contains a static List of ChatRoom used to control the existing rooms and their users
    private static List<ChatRoom> roomList = new ArrayList<>();
    private static Map<String,ChatRoom> sessions = new HashMap<>();
    private Map<String, String> usernames = new HashMap<String, String>();
    // you may add other attributes as you see fit

    @OnOpen
    public void open(@PathParam("roomID") String roomID, Session session) throws IOException, EncodeException {
        RemoteEndpoint.Basic out = session.getBasicRemote();
        // try joining
<<<<<<< HEAD
        ChatRoom room = getRoom(roomID,session);
        String userId = session.getId();

        for(ChatRoom Rom : roomList){
            if(roomID.equals(Rom.getCode())){
                usernames.put(userId, message.trim());
                Rom.setUserName(userId, message.trim());
                session.getBasicRemote().sendText("{\"message\":\"(Server"+room.getCode()+
                        "): Welcome, " + message + "!\"}");
            }
        }

=======
        ChatRoom room = getRoom(roomID);
>>>>>>> 9138cb6ba785df5d3971af868475266feea8cd4f
        if(room == null){
            room = new ChatRoom(roomID, session.getId());
            roomList.add(room);
        }
<<<<<<< HEAD

=======
        sessions.put(session.getId(),room);
>>>>>>> 9138cb6ba785df5d3971af868475266feea8cd4f
        out.sendText(createMessage("Server "+roomID,
                "Welcome to the server. Please enter a username."));
    }

    @OnClose
    public void close(Session session) throws IOException, EncodeException {
        String userId = session.getId();
        String username = usernames.get(userId);
        if (sessions.containsKey(userId)) {
            ChatRoom room = sessions.get(userId);
            usernames.remove(userId);
            // remove this user from the ChatRoom
            room.removeUser(userId);



            // broadcasting it to peers in the same room
            for (Session peer : session.getOpenSessions()){ //broadcast this person left the server

                System.out.println(peer.getId());

                if(sessions.get(peer.getId()).getCode().equals(room.getCode())) { // broadcast only to those in the same room
                    peer.getBasicRemote().sendText("{\"message\":\"(Server): " + username + " left the chat room.\"}");
                }
            }
            if (room.getUsers().isEmpty()) {
                roomList.remove(room);
            }
        }
    }

    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException, EncodeException {
        String userId = session.getId();
        JSONObject msg = new JSONObject(comm);
        ChatRoom room = sessions.get(userId);
        String message = msg.get("message").toString();

        if(usernames.containsKey(userId)){ // not their first message
            String username = usernames.get(userId);

            // broadcasting it to peers in the same room
            for(Session peer: session.getOpenSessions()){

                System.out.println(peer.getId());
                System.out.println(sessions.get(peer.getId()).getCode());
                System.out.print(room.getCode());
                for (String key : sessions.keySet()){
                    System.out.println(key + " , " + sessions.get(key).getCode());
                }
                // only send my messages to those in the same room
                if(room.inRoom(peer.getId())) {

                    System.out.println("Daniel is racist");

                    peer.getBasicRemote().sendText("{\"message\":\"(" + username + "): " + message + "\"}");
                }
            }
            return;
        }

        usernames.put(userId, message.trim());
        room.setUserName(userId, message.trim());
        session.getBasicRemote().sendText("{\"message\":\"(Server"+room.getCode()+
                "): Welcome, " + message + "!\"}");
    }

    public ChatRoom getRoom(String roomID){
        for(ChatRoom room : roomList){
            if(room.getCode().equals(roomID)){
                return room;
            }
        }
        return null;
    }

    public String createMessage(String user, String text){
        return "{\"message\":\"("+user+"): "+text+"\"}";
    }
}