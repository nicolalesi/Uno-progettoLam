const { info } = require("console");
const express = require("express");
const { createServer, ClientRequest } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });


var utentiConnessi=[];
var sockets=[];
var rigioca=0;
var infoUtente=[{
  carteInMano: []},
  {carteInMano: []
}];



app.get('/', (req, res) => {
    res.sendFile( __dirname + '/index.html');
  });

//devo creare una nuova stanza ogni due giocatori 
//tengo conto degli utenti connessi, se sono 3,5,7 dispari, creo una nuova stanza
//mando il nome della stanza agli utenti che ad ogni comunicazione devono specificare la stanza in cui si trovano
//ogni stanza ha infoUtente 
io.on("connection", (socket) => {


  socket.on("NomeUtente",msg=>{
    
    var username;
    var numeroGiocatore;
    if(utentiConnessi.length<2){
      numeroGiocatore=utentiConnessi.length+1;
      console.log(msg);
      username=msg+" G"+numeroGiocatore;
      utentiConnessi.push(username);
      console.log(utentiConnessi);
      sockets.push(socket);
      //console.log(sockets);
      socket.join("Partita");
    }
    socket.emit("User",username);

    if(utentiConnessi.length==2){
      var randomNumber = Math.floor(Math.random() * 53);
      if(randomNumber==40 || randomNumber ==39)
        randomNumber=Math.floor(Math.random() * 53);
      io.emit("Start game",utentiConnessi[0]);
      io.emit("firstCentralCard",randomNumber);
    }

  });

  socket.on("Rigioca",({nomeUtente})=>{
    console.log(" Rigioca da "+nomeUtente);
    
    rigioca+=1;
    
    if(rigioca==2){
      var randomNumber = Math.floor(Math.random() * 53);
      if(randomNumber==40 || randomNumber == 39)
        randomNumber=Math.floor(Math.random() * 53);
      io.emit("restart","Riparte il gioco");
      io.emit("firstCencdtralCard",randomNumber);
      rigioca=0;
    }
    else
      io.emit("Wait",nomeUtente);  
  });


  socket.on("changeColor",color=>{
    console.log("Cambio colore in "+color);
    io.emit("changeColor",color);
  });
    


  socket.on("addCards",({user,number})=>{

    console.log("Aggiungi carte da "+user+" "+number);

    var indice;
      for(var i=0;i<utentiConnessi.length;i++){
        if(utentiConnessi[i]!=user){
          for(var j=0;j<number;j++){
            var randomNumber=Math.floor(Math.random() * 53);
            infoUtente[i].carteInMano.push(randomNumber);
            indice=i;
          }
        }
    }


      //console.log("Mano completa con carte aggiunte "+manoCompleta);
      io.emit("addCards",({username: user,numeroCarte: number,carteInMano: infoUtente[indice].carteInMano}));
      io.emit("carteAvversario",{user : utentiConnessi[indice], numeroCarte : infoUtente[indice].carteInMano.length});
    }); 

 
    socket.on("cartaCentrale",({forClients,forServer})=>{
      io.emit("cartaCentrale",forClients);
      console.log(forClients);
      console.log("Nome carta "+forServer);
    });

    socket.on("cambioTurno",nomeUtente=>{
      for(var i=0;i<utentiConnessi.length;i++){
        if(utentiConnessi[i]!=nomeUtente){
          io.emit("cambioTurno",utentiConnessi[i]);
        }
      }
    });

    socket.on("myCards",({user,hand,carteInMano})=>{

      console.log("Possessore carte "+user);
      console.log("Numero carte rimaste "+hand);
      console.log("Carte in mano "+carteInMano);

      for(var i=0;i<utentiConnessi.length;i++){
        if(utentiConnessi[i]==user)
          infoUtente[i].carteInMano=carteInMano;
      }
      console.log("Info utente "+infoUtente[0].carteInMano);
      io.emit("carteAvversario",{user : user, numeroCarte : hand});

      if(hand==0)
       io.emit("endGame",user);

    });

    socket.on("disconnection",msg=>{
      console.log(msg);
      //io.disconnectSockets();
      
      const index = sockets.indexOf(socket);
      socket.disconnect(true);
      sockets.splice(index,1);
      utentiConnessi.splice(index,1);


    });

});

io.on("disconnect",(socket)=>{
  console.log(socket.id+" si sta disconnettendo");
});



httpServer.listen(3000);