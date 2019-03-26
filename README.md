# Node.js
Servidor nodejs de Firebase

Tutorial de como añadir notificaciones de firebase a Node.js

1.- Instalamos firebase-admin en el servidor con npm install firebase-admin

2.- En la consola de firebase, vamos a herramientas del proyecto, y en la pestaña de servicio
seleccionamos Node.js y copiamos este código.

```
  var admin = require("firebase-admin");

  var serviceAccount = require("path/to/serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-nodejs-55aca.firebaseio.com"
  });
```

3.- Hacemos clic en Generar nueva clave privada y descargamos el archivo .json

4.- Nos dirigimos al servidor y en el fichero app.js copiamos el código anterior. En la variable serviceAccount
introducimos la ruta del json que previamente tenemos que subir al servidor.

5.- En el servidor recogemos el token del cliente al que queremos enviar la notificación y creamos un tópico

6.- Añadimos al cliente a ese tópico

```
refj.once("value",function(snapshot){
    snapshot.forEach(function(snap){
        tjugadores.push(snap.val().token);
        admin.messaging().subscribeToTopic(snap.val().token, 'topico');
    });
});
```

7.- Creamos la variable topico y mensaje donde especificamos lo que queremos enviar

```
  var topic = 'topico';
          var message = {
            notification: {
              title: 'titulo',
              body: 'mensaje'
            },
            topic: topic
          };

          // Se envía el mensaje a los usuarios registrados en el tópico
          admin.messaging().send(message)
            .then((response) => {
              // Response is a message ID string.
              console.log('Successfully sent message:', response);
            })
            .catch((error) => {
              console.log('Error sending message:', error);
          });
```
