// imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


// inicializamos la conexion con firebase
// necesitamos json con las credenciales 
var admin = require('firebase-admin');
var serviceAccount = require('./dbfirebase.json');
admin.initializeApp({

    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fir-nodejs-55aca.firebaseio.com'
});

var db = admin.database();
var refj = db.ref("/jugadores");
var refScore = db.ref("/puntuacion");
var mapScore = new Map();
var resultado = null;
var score = 0;
var tjugadores = [];
var clave;
var obj;


refScore.once("value",function(snapshot){
    snapshot.forEach(function (snap) {
        mapScore.set(snap.key,snap.val());
        console.log(mapScore.size);
    });
    
});


refj.once("value",function(snapshot){
    snapshot.forEach(function(snap){
        tjugadores.push(snap.val().token);
        admin.messaging().subscribeToTopic(snap.val().token, 'jugadores');
    });
});


refj.on("child_changed", function(snapshot) {
    //nombre del child
    console.log("key: " + snapshot.key);
   
    //valores del child
    console.log("respuesta: " + snapshot.val().respuesta);
    if(snapshot.val().respuesta=="true"){
        if(mapScore.has(snapshot.key)){
            mapScore.set(snapshot.key,mapScore.get(snapshot.key)+1);
            clave = snapshot.key;
            console.log("clave: "+clave);
            score = mapScore.get(clave);
            obj = {};
            obj[clave] = score;
            refScore.update(obj);
        }else{
           mapScore.set(snapshot.key,1);
            clave = snapshot.key;
            console.log("clave: "+clave);
            score = mapScore.get(clave);
            obj = {};
            obj[clave] = score;
            refScore.update(obj);
        }
    }else if (snapshot.val().acabo == "true"){
        
        var topic = 'jugadores';
        var message = {
          notification: {
            title: 'Puntuacion',
            body: 'El usuario '+clave+' tiene '+score+' puntos, intenta superarlo!'
          },
          topic: topic
        };

        // Send a message to devices subscribed to the provided topic.
        admin.messaging().send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
          })
          .catch((error) => {
            console.log('Error sending message:', error);
        });
    }
});


//especificamos el subdirectorio donde se encuentran las páginas estáticas
app.use(express.static(__dirname + '/html'));

//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/enviar', (req, res) => {
    let token = req.body.token;
    let msg = req.body.msg;
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += `<p>(${token}/${msg}) Enviado </p>`;
    pagina += '</body></html>';
    res.send(pagina);
    
    // This registration token comes from the client FCM SDKs.
    var registrationToken = token;
    
    // See documentation on defining a message payload.
   

});

app.get('/mostrar', (req, res) => {
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += 'Muestro<br>';
    pagina += '<div id="resultado">' + resultado + '</div>'
    pagina += '<p>...</p>';
    pagina += '</body></html>';
    res.send(pagina);
});


var server = app.listen(8080, () => {
    console.log('Servidor web iniciado');
});