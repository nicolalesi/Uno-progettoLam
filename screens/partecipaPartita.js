// partecipaPartita

import React, { Component,useContext,useState,useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Image, Button, BackHandler, Alert, ImageBackground, Pressable,TouchableOpacity,Modal, ScrollView } from 'react-native';
window.navigator.userAgent='react-native';
import client from '../logica/client';
import * as ScreenOrientation from 'expo-screen-orientation';
import cards from '../logica/cards';
import {carte} from '../logica/cards';
import { cardName } from '../logica/cards';
import table from '../resources/Table_3.png';
import deck from '../resources/Deck.png';
import { wildColor } from '../logica/cards';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import { Audio } from 'expo-av';


const showAlert = () =>
  Alert.alert(
    "Non puoi giocare questa carta",
    "Scegli un'altra carta da giocare",
    [
      {
        text: "Riprova",
        style: "cancel",
      },
    ],
    {
      cancelable: true,
      onDismiss: () =>
        Alert.alert(
          "This alert was dismissed by tapping outside of the alert dialog."
        ),
    }
  );


const alertCard = () =>
  Alert.alert(
    "Controlla bene!",
    "Hai carte da giocare",
    [
      {
        text: "Riprova",
        style: "cancel",
      },
    ],
    {
      cancelable: true,
      onDismiss: () =>
        Alert.alert(
          "This alert was dismissed by tapping outside of the alert dialog."
        ),
    }
);

  
const alertButtons = () =>
Alert.alert(
  "Non puoi cliccare questo pulsante",
  "Se vuoi passare prima devi pescare se hai pescato non puoi pescare un'altra volta",
  [
    {
      text: "Riprova",
      style: "cancel",
    },
  ],
  {
    cancelable: true,
    onDismiss: () =>
      Alert.alert(
        "This alert was dismissed by tapping outside of the alert dialog."
      ),
  }
);

var instanceCards=new cards();
var clientConnection;

export default function partecipaPartita ({navigation}){

    const [nomeUtente, setNomeUtente] = useState();
    const [usernameInserito,setUsernameInserito]=useState(false);
    const [cartaCentrale,setCartaCentrale]=useState();
    const [hand,setHand]=useState(instanceCards.initialCards());
    const [enemyCardNumber,setEnemyCardNumber]=useState(5);
    //const [userCarteRicevute,setUserCarteRicevute]=useState();
    const [statoDiGioco,setStatoDiGioco]=useState(false);
    const [turno,setTurno]=useState();
    const [endGame,setEndGame]=useState(false);
    const [actualColor,setActualColor]=useState();
    const [pulsantePesca,setPulsantePesca]=useState(true);
    const [pulsantePassa,setPulsantePassa]=useState(false);
    const [modalVisible,setModalVisible]=useState(false);
    const [addCardsReceived,setAddCardsReceived]=useState(0);
    const [turnoExtra,setTurnoExtra]=useState(false);
    const [sound, setSound] = useState();

    var handForLogics=hand;
    var coloreAttuale;
    var myUser;
    var punteggio=0;
    var enemyPunteggio=0;

    async function playSound() {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync( require('../resources/esploratoriCielo.mp3')
      );
      setSound(sound);
  
      console.log('Playing Sound');
      await sound.playAsync();
    }

    React.useEffect(() => {
      return sound
        ? () => {
            console.log('Unloading Sound');
            sound.unloadAsync();
          }
        : undefined;
    }, [sound]);

    const colorAlert = () =>
    Alert.alert(
      "Cambio colore in",
      coloreAttuale,
      [
        {
          text: "Ok",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () =>
          Alert.alert(
            "This alert was dismissed by tapping outside of the alert dialog."
          ),
      }
    );

    const winnerLoser = (winner) =>
    Alert.alert(
      "Partita finita",
      winner+" Punteggio "+punteggio+ " "+myUser +" Punteggio avversario "+enemyPunteggio,
      [
        {
          text: "Gioca ancora",
          onPress : () => {restartGame();}
        },
        {
          text :"Esci",
          onPress : () =>{navigation.navigate('Home')}
        }
      ],
  );
  

    //forse +2 e +4 vanno male perché vanno con dati vecchi
    function restartGame(){
      clientConnection.socket.emit("Rigioca",{nomeUtente:myUser});
    }

    function changeColor(color){
      clientConnection.socket.emit("changeColor",color);
      setModalVisible(false);
      clientConnection.socket.emit("cambioTurno",nomeUtente);
    }  

    function insertUser(){

      return (
        <View style={styles.inputUsername}>
        {!usernameInserito ?
          <TextInput onChangeText={setNomeUtente} value={nomeUtente} placeholder="Inserisci nome utente" onSubmitEditing={()=>sendNomeUtente()}/>
                : 
           <Text> {nomeUtente} Attendi che si connetta un altro giocatore </Text> 
               }
        </View>
      )
    
    }


    function sendNomeUtente(){

      clientConnection=new client();

      clientConnection.socket.on("User",utente=>{
        console.log(utente); 
        myUser=utente; 
        setNomeUtente(utente);
      });

      /*clientConnection.socket.on("StatoGiocoForClients",({
        cartaCentrale, numeroCarteRimaste, carteDaAggiungere, utente
      })=>{
        console.log("Carta centrale " + cartaCentrale, "Numero carte rimaste "+numeroCarteRimaste+" Carte da aggiungere "+ carteDaAggiungere+ "Utente "+utente );

        setCartaCentrale(cartaCentrale);
      });*/

      clientConnection.socket.on("carteAvversario",({user,numeroCarte})=>{

        if(user != myUser){
          setEnemyCardNumber(numeroCarte);
          //setUserCarteRicevute(user);
        }

      });

      clientConnection.socket.on("addCards",({username,numeroCarte,carteInMano})=>{
        console.log("Aggiungi carte "+ numeroCarte);

        if(username!=myUser){
  
          handForLogics=carteInMano;
          setHand(carteInMano);

        }
      });

      clientConnection.socket.on("restart",msg=>{
        console.log("Rigioca "+msg);
        setEndGame(false);
        setHand(instanceCards.initialCards());
        setEnemyCardNumber(5);
        //setUserCarteRicevute("All");
      });


      clientConnection.socket.on("Start game",msg=>{
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        console.log(msg);
        setStatoDiGioco(true);  
        setTurno(msg);
      });

      clientConnection.socket.on("cambioTurno",nomeUtente=>{
        setTurno(nomeUtente);
      });

      clientConnection.socket.on("cartaCentrale",carta=>{
        setCartaCentrale(carta);
      });

      clientConnection.socket.on("firstCentralCard",carta=>{
        //console.log("Carta centrale "+carta);
        //console.log("Carta centrale nome "+cardName[carta]);
        setCartaCentrale(carta);
        socket.emit("firstRandomCard",cardName[carta]);
      });

      clientConnection.socket.on("endGame",user=>{
        setEndGame(true);
        if(myUser==user){
          punteggio+=1;
          winnerLoser("Winner");

        }
        else{
          enemyPunteggio+=1;
          winnerLoser("Loser");
        }  
      });


      clientConnection.socket.on("changeColor",color=>{
        console.log("Cambio colore in "+color);
        setActualColor(color);
        coloreAttuale=color;
        colorAlert();
        //da capire se posso giocare sempre carte di questo colore
      });

      clientConnection.socket.emit("NomeUtente",nomeUtente);
      clientConnection.socket.emit("myCards", 
      {user: myUser,
       hand: handForLogics.length,
       carteInMano:handForLogics
     })
      setUsernameInserito(true);
      

    }
    

    useEffect(() => {

      playSound();
      
        return () => {

          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

          clientConnection.socket.emit("disconnection",nomeUtente);

        }
    }, [])

  pesca = () => {
    if(!pulsantePassa && nomeUtente==turno){
      console.log("Pesca");
      if(instanceCards.canYouPass(hand,cartaCentrale))
        alertCard();
      else {  
      setHand(instanceCards.addedCards(hand,1));
      clientConnection.socket.emit("myCards", 
      {user: nomeUtente,
       hand: hand.length+1,
       carteInMano:hand
     })
     setPulsantePassa(true);
     setPulsantePesca(false);
    }
  }
  else {
    alertButtons();
  }

    }

  passo = () => {
      handForLogics=hand;
      console.log("Carte in mano "+handForLogics.length);
    if(!pulsantePesca && nomeUtente==turno){
      console.log("Passo");
      if(instanceCards.canYouPass(hand,cartaCentrale))
       alertCard();
      else
        clientConnection.socket.emit("cambioTurno",nomeUtente);  
      setPulsantePesca(true);
      setPulsantePassa(false);
    }
    else
    {
      alertButtons();
    }
      
    }

//manca controllo username
  onCardPress = (numberOfCard) =>{

  var canPlayCard=instanceCards.cartaGiocata(cardName[cartaCentrale],cardName[hand[numberOfCard]],actualColor);
  var centralCard;
  var carteDaAggiungere=0;
  var cambioTurno;
  var cambioColore=false;
  var cartaGiocata;
  var arrayCarteDaAggiungere=[];
  console.log(" Sono "+nomeUtente);
  console.log("Turno extra "+turnoExtra);

  if(turnoExtra){
    console.log("Hai un turno extra");
    canPlayCard=instanceCards.cartaExtraGiocata(cardName[cartaCentrale],cardName[hand[numberOfCard]]);
    setTurnoExtra(false);
  }

  if(canPlayCard!=false){

   centralCard=hand[numberOfCard];
   clientConnection.socket.emit("cartaCentrale",({forClients: hand[numberOfCard],forServer: cardName[hand[numberOfCard]]}));

   cartaGiocata=hand[numberOfCard];
   reorderHand(hand[numberOfCard]);

  if(canPlayCard==2){
    clientConnection.socket.emit("addCards",{user:nomeUtente,number: 2});  
  }
  if(canPlayCard==4){

    setModalVisible(true);
    clientConnection.socket.emit("addCards",{user:nomeUtente,number: 4});
    cambioColore=true;
  }

  if(canPlayCard=='Wild'){
    setModalVisible(true);
    cambioColore=true;
  }

  if(canPlayCard=='reverse' || instanceCards.turnoExtra(hand,cartaGiocata) ){

    cambioTurno=false;

    if(canPlayCard!='reverse') 
      setTurnoExtra(instanceCards.turnoExtra(hand,cartaGiocata));

    console.log("Turno extra "+turnoExtra);
     
  }
  else { 
    cambioTurno=true;
    if(!cambioColore)
      clientConnection.socket.emit("cambioTurno",nomeUtente);  

  }
   // console.log("Carta giocata"+canPlayCard);

   //console.log("Io sono "+nomeUtente);
   clientConnection.socket.emit("myCards", 
   {user: nomeUtente,
    hand: hand.length,
    carteInMano:hand
  })

    setPulsantePesca(true);
    setPulsantePassa(false);
  
  
    handForLogics=hand;
    console.log("Carte in mano "+handForLogics.length);

    /*clientConnection.socket.emit("StatoGioco",({
      cartaCentrale: centralCard,
      numeroCarteRimaste: hand.length,
      carteDaAggiungere : carteDaAggiungere,
      username: nomeUtente
    }))*/
  }
  else{
   showAlert();
  }

}

  function reorderHand  (carta) {

    const index = hand.indexOf(carta);
    hand.splice(index,1);
      
  }

  function updateHand(){
    console.log("Aggiorna mano");
      setHand(instanceCards.addedCards(hand,addCardsReceived));
  }



            return (
              <>
              {! endGame ? 
              <View style={styles.container}>
              {statoDiGioco   ? 
              <ImageBackground source={table} resizeMode="cover" style={styles.background}>
                <View style={styles.campoGioco}> 
                <View style={styles.enemyCard}>         
                {[...Array(enemyCardNumber)].map((item,index)=>{
                      return <Image key={index} source={deck} style={styles.deck}></Image>
                      })}
                  </View>                                 
                  <View style={styles.deckContainer}>
                      <TouchableOpacity style={styles.surrenderButton} onPress={()=>pesca()}>
                        <Text style={styles.surrenderText}> Pesca</Text> 
                      </TouchableOpacity>
                      <Image source={deck} style={styles.centerCard}></Image>
                      <Image source={carte[cartaCentrale]} style={styles.centerCard}></Image>
                      <TouchableOpacity style={styles.passoButton} onPress={()=>passo()}>
                        <Text style={styles.passoText}> Passo </Text>
                      </TouchableOpacity>
                  </View>
                  {nomeUtente==turno ?
                  <View style={styles.myCards}>
                    <Modal
                        animationType="fade"
                        visible={modalVisible}
                        style={styles.modale}
                        transparent={true}
                  >
                    <View style={styles.viewModale}>
                        <Text style={styles.modalTitle}> Scegli il colore </Text>
                        <View style={styles.primaRiga}>
                          <TouchableOpacity style={styles.blue} onPress={()=>changeColor("Blue")}>
                            <Text style={styles.modalTxt}> Blue</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.red} onPress={()=>changeColor("Red")}>
                            <Text style={styles.modalTxt}> Rosso</Text>
                          </TouchableOpacity>
                      </View>
                      <View style={styles.secondaRiga}>
                        <TouchableOpacity style={styles.yellow} onPress={()=>changeColor("Yellow")}>
                          <Text style={styles.modalTxt}> Giallo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.green} onPress={()=>changeColor("Green")}>
                          <Text style={styles.modalTxt}> Verde</Text>
                        </TouchableOpacity>
                      </View>  
                    </View>
                  </Modal>
                    <Text style={styles.yourName} onLayout={()=>updateHand()}>{nomeUtente}</Text>
                  {hand.map((item,index)=>{
                      return(
                      <TouchableOpacity style={styles.myTouchableCard} key={index} onPress={() => onCardPress(index)}>
                       <Image key={index} source={carte[item]} style={styles.img}></Image>
                      </TouchableOpacity> 
                      )
                      })}
                      <Text style={styles.scrittaTurno}> Tocca a te</Text>                  
                  </View>  
                  :<View style={styles.myCards}>
                    <Text style={styles.yourName} >{nomeUtente}</Text>
                    {hand.map((item,index)=>{
                      return(
                       <Image key={index} source={carte[item]} style={styles.enemy}></Image>
                      )
                      })}
                                        <Text style={styles.scrittaTurno}> Tocca a {turno}</Text>                  
                    </View>}
                </View>
              </ImageBackground>
                  :  
                  insertUser()      } 
            </View>
            : <View style={styles.container}>
              <View style={styles.finalAnnounce}>
                {endGame && hand.length==0 ? 
                  <Text style={styles.endTxt}> Hai vinto</Text>
                  :
                  <Text style={styles.endTxt}> Hai perso</Text>
                }
              </View>  
            </View>
            }
            </>     
              )
            }
    //      }

    const styles = StyleSheet.create({
      container: {
          flex: 1,
          backgroundColor: '#E0FFFF',
                },
      myTouchableCard: {
          height:87,
          width:'8%',
          marginRight:2 
      },
      img: {
          height:87,
          width:'100%',
          marginRight:2
      },
      enemy:{
          height:85,
          width:'8%',
          marginRight:2
            },
      deck: {
          height: 85,
          width : '8%',
          marginRight:2
      },
      centerCard: {
          height: 85,
          width : '8%',
      },
      enemyCard:{
          flexDirection: 'row',
          justifyContent: 'center'
      },
      myCards: {
          flexDirection: 'row',
          justifyContent: 'center'
      },
      deckContainer: {
          flexDirection:'row',
          justifyContent:'center',
          alignContent:'center',
          marginTop:'5%',
          marginBottom:'5%',
      },   
      campoGioco: {
          display: 'flex',
          flexDirection:'column',
      },
      background: {
          flex:1,
          justifyContent: 'center'
        },
      surrenderButton: {
          width: 100,
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          borderRadius: 100,
          backgroundColor: '#cc0000',
          marginRight:'23%'
        },
      surrenderText: {
          fontSize: 16,
          lineHeight: 21,
          fontWeight: 'bold',
          letterSpacing: 0.25,
          color: 'white',
        },
      passoButton: {
          width: 100,
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          borderRadius: 100,
          backgroundColor: '#ffd700',
          marginLeft:'23%'
        },
      passoText: {
          fontSize: 16,
          lineHeight: 21,
          fontWeight: 'bold',
          letterSpacing: 0.25,
          color: 'white',
        },
      inputUsername: {
        alignSelf: 'center',
        alignContent: 'center',
        marginTop: '90%'
      },
      scrittaTurno: {
        color: 'yellow',
        marginLeft: 20,
        fontFamily: 'sans-serif-condensed'
      },
      yourName: {
        color: 'red',
        marginRight: 20,
        fontFamily: 'sans-serif-condensed'
      },
      endTxt: {
        color: 'black',
      },
      choseColor: {
        position:'absolute'
      },
      modale :{
        backgroundColor: 'white',
        width: '20%',
        height: '20%', 
      }, 
      finalAnnounce : {
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center'
      },
      viewModale:{
        display:'flex',
        alignItems:'center',
        backgroundColor: '#DBDBDB',
        padding :20,
        margin: 20,
        borderRadius :20
      },
      modalTitle:{
        color:'black',
        marginBottom: 20
      },
      primaRiga: {
        flexDirection: 'row',
      },
      secondaRiga: {
        flexDirection: 'row'
      },
      blue:{
        padding:10,
        backgroundColor: 'blue',
        borderRadius: 20,
        marginRight: '25%',
      },
      red: {
        padding:10,
        backgroundColor: 'red',
        borderRadius: 20,
      },
      yellow:{
        padding:10,
        backgroundColor: 'yellow',
        borderRadius: 20,
        marginRight: '25%',
        marginTop: 10
      },
      green:{
        padding:10,
        backgroundColor: 'green',
        borderRadius: 20,
        marginTop: 10
      }    
    });