// Copia este archivo como environment.ts y environment.development.ts
// y rellena los valores desde Firebase Console → Configuración General → Tus Apps
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROYECTO.firebaseapp.com',
    projectId: 'TU_PROYECTO_ID',
    storageBucket: 'TU_PROYECTO.appspot.com',
    messagingSenderId: 'TU_MESSAGING_SENDER_ID',
    appId: 'TU_APP_ID',
  },
};
