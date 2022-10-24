// Home.js

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { Component } from 'react';

const showAlert = () =>
  Alert.alert(
    "Informazioni",
    "Clicca su partecipa partita, attendi che un altro giocatore faccia la stessa cosa, quando ciò avviene la partita inizia in automatico",
    [
      {
        text: "Capito!",
      },
    ],
    {
      cancelable: true,
    }
  );

export class Home extends Component {
  render() {
    return (
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Text style={styles.titolo} > UNO </Text>
          <View style={styles.buttonsLabel}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('partecipaPartita')} title="partecipa a partita "
              style={{ backgroundColor: '#FF0000', marginTop:40, borderRadius:5 }}>
              <Text style={styles.textStyle}>Partecipa a partita</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showAlert()}
              style={{ backgroundColor: '#0000CD', marginTop:40, borderRadius:5 }}>
              <Text style={styles.textStyle}>Istruzioni connessione</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }
}

  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E0FFFF',
    },
    titolo:{
      fontSize:30,
      fontWeight: 'bold',
      color: '#FF0000', 
      marginTop: -90
    },
    buttonsLabel:{
      display:'flex',
      marginTop:100
    },
    textStyle:{
      fontSize: 20, 
      color: '#fff', 
      padding:20, 
      alignSelf:'center'
    },
  });
  
  
export default Home