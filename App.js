import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
window.navigator.userAgent='react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import Home from './screens/Home';
import partecipaPartita from './screens/partecipaPartita';

//dichiarazione navigazione tra schermate
export const stackNavigator = createStackNavigator({
  Home: {
      screen: Home,
      navigationOptions:  ({ navigation }) => ({
        title: `Chose a game mod`,
        headerShown: false,
      }),
  },
  partecipaPartita:{
    screen: partecipaPartita,
    navigationOptions: ({ navigation }) => ({
      title: `Partecipa a partita`,
      headerShown: false
    }),
  
  },
  });

const AppNavigator = createAppContainer(stackNavigator);

export default function App (){

    return (
      <View style={styles.container}>
        <AppNavigator />
      </View>
    )
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
});
