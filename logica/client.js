import React, { Component,useContext,useState,useEffect} from 'react';
window.navigator.userAgent='react-native';
import io from 'socket.io/client-dist/socket.io';

//connessione al server
export default class client extends React.Component{

    constructor(props){
        super(props);

        this.socket=io("http://172.20.10.4:3000");
      }

      

}