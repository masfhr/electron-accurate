/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const {contextBridge, ipcRenderer} = require('electron');

const api = {
    send: ( channel, data ) => new Promise((resolve, reject) => {
      ipcRenderer.on( channel+'-reply', function( event, data ){
        resolve(data)
      })
      ipcRenderer.send( channel, data )
    }),
    receive: ( channel, callable, event, data ) => ipcRenderer.on( channel, callable( event, data ) )
};

ipcRenderer.on("authUser", (event, data) => {
    localStorage.clear();
    localStorage.setItem('authUser', data);
})

// console.log('hallo');

window.addEventListener('DOMContentLoaded', () => {
    api.send('get-login', '').then((r) => {
        let dataObject = JSON.parse(r);
        document.getElementById("email").value = dataObject[0].name;
        document.getElementById("password").value = dataObject[0].password;
    });
    
    document.getElementById("login-form").addEventListener('keyup', () => {
        let email = document.getElementById("email").value,
            password = document.getElementById("password").value;
        
        ipcRenderer.send('login', JSON.stringify({email: email, password:password}));
    });
})

contextBridge.exposeInMainWorld(
    "route", {
        send: ( channel, data ) => new Promise((resolve, reject) => {
            ipcRenderer.on( channel+'-reply', function( event, data ){
              resolve(data)
            })
            ipcRenderer.send( channel, data )
        }),
        receive: ( channel, callable, event, data ) => ipcRenderer.on( channel, callable( event, data ) )
    }
);
