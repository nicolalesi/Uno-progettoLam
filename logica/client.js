import React, { Component,useContext,useState,useEffect} from 'react';
window.navigator.userAgent='react-native';
import io from 'socket.io/client-dist/socket.io';

export default class client extends React.Component{

    constructor(props){
        super(props);

        this.socket=io("http://192.168.1.118:3000");
      }

      

}