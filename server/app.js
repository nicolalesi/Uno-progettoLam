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


io.on("connection", (socket) => {

//Inviamo al giocatore il nome utente completo che userà nella sessione di gioco
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
      socket.join("Partita");
    }
    socket.emit("User",username);

    //se sono connessi due utenti inizia la partita
    if(utentiConnessi.length==2){
      var randomNumber = Math.floor(Math.random() * 53);
      if(randomNumber==40 || randomNumber ==39)
        randomNumber=Math.floor(Math.random() * 53);
      io.emit("Start game",utentiConnessi[0]);
      io.emit("firstCentralCard",randomNumber);
    }

  });

  //Se dopo la fine della partita entrambi intendono rigiocare riparte la partita
  socket.on("Rigioca",({nomeUtente})=>{
    console.log(" Rigioca da "+nomeUtente);
    
    rigioca+=1;
    
    if(rigioca==2){
      var randomNumber = Math.floor(Math.random() * 53);
      if(randomNumber==40 || randomNumber == 39)
        randomNumber=Math.floor(Math.random() * 53);
      io.emit("restart","Riparte il gioco");
      io.emit("firstCentralCard",randomNumber);
      rigioca=0;
    }
    else
      io.emit("Wait",nomeUtente);  
  });


  //segnale di cambio colore da inviare ai clients
  socket.on("changeColor",color=>{
    console.log("Cambio colore in "+color);
    io.emit("changeColor",color);
  });
    

  //aggiunge le carte dopo la ricezione di un segnale "addCards" e le invia ai clients che aggiorneranno la mano
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

      io.emit("addCards",({username: user,numeroCarte: number,carteInMano: infoUtente[indice].carteInMano}));
      io.emit("carteAvversario",{user : utentiConnessi[indice], numeroCarte : infoUtente[indice].carteInMano.length});
    }); 

 
    //aggiornamento carta centrale del tavolo
    socket.on("cartaCentrale",({forClients,forServer})=>{
      io.emit("cartaCentrale",forClients);
      console.log(forClients);
      console.log("Nome carta "+forServer);
    });

  //segnale di cambio turno    
    socket.on("cambioTurno",nomeUtente=>{
      for(var i=0;i<utentiConnessi.length;i++){
        if(utentiConnessi[i]!=nomeUtente){
          io.emit("cambioTurno",utentiConnessi[i]);
        }
      }
    });

    //i clients inviano le carte che hanno in mano così da permettere al server di tenerne conto
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

    //disconnessione che avviene quando si esce dalla schermata
    socket.on("disconnection",msg=>{
      console.log(msg);
      
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