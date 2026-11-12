# Conectar el creador de avatares de Unity

El lado web ya está listo y espera en `/avatar`. Falta el build de Unity y
los dos fragmentos que abren el puente entre ambos.

## 1. Exportar el build

En Unity: **File › Build Settings › WebGL**, y en **Player Settings**:

- **Compression Format**: `Disabled`, o `Gzip` con **Decompression Fallback**
  activado. Si se deja comprimido sin fallback, el servidor tiene que mandar
  el `Content-Encoding` correcto y es lo que más suele romperse.
- El nombre del build tiene que ser `avatar`, porque así se llaman los
  archivos que busca la web.

Copia la carpeta `Build` resultante a `public/avatar/`, de modo que queden:

    public/avatar/Build/avatar.loader.js
    public/avatar/Build/avatar.data
    public/avatar/Build/avatar.framework.js
    public/avatar/Build/avatar.wasm

## 2. El plugin que habla con la web

Crea `Assets/Plugins/WebGL/Materama.jslib`:

```javascript
mergeInto(LibraryManager.library, {
  MateramaAvatarListo: function (json) {
    var texto = UTF8ToString(json);
    if (window.materamaAvatarListo) window.materamaAvatarListo(texto);
  },
});
```

## 3. El objeto que recibe y entrega

En la escena, un GameObject llamado exactamente **`Avatar`** con este script.
El nombre importa: es la dirección a la que la web manda sus mensajes.

```csharp
using System.Runtime.InteropServices;
using UnityEngine;

public class PuenteAvatar : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void MateramaAvatarListo(string json);

    /// La web lo llama al abrir la página, con lo que se guardó la vez
    /// anterior. Si el niño nunca guardó nada, no llega nada.
    public void Cargar(string json)
    {
        // reconstruye el avatar a partir del json
    }

    /// La web lo llama cuando el niño aprieta "Guardar mi avatar".
    public void Exportar()
    {
        string json = JsonUtility.ToJson(/* tu configuración */);

#if UNITY_WEBGL && !UNITY_EDITOR
        MateramaAvatarListo(json);
#endif
    }
}
```

Si tu creador tiene su propio botón de guardar, que llame a `Exportar()` y
funciona igual: la web guarda lo que le llegue, venga de donde venga.

## 4. El JSON

La web no mira adentro del JSON: lo guarda tal cual y te lo devuelve igual.
Tú decides qué lleva.

La única parte que sí lee es opcional: si el JSON trae un campo `miniatura`
con una imagen en formato `data:image/...`, la usa para mostrar la carita en
la cabecera y en la página del avatar, sin tener que abrir Unity.

```json
{
  "piel": 3,
  "pelo": { "forma": 2, "color": "#8b4513" },
  "miniatura": "data:image/png;base64,iVBORw0KG..."
}
```

Para generar esa miniatura en Unity basta una cámara apuntando a la cara,
un `RenderTexture` chico y `ImageConversion.EncodeToPNG`. **Que no pase de
128 × 128**: todo el perfil vive en un documento de Firestore y el límite es
1 MB.

## 5. Firestore

El avatar se guarda en la colección `perfiles`, un documento por usuario con
su `uid` de nombre. Hay que crear la base en la consola de Firebase y dejar
estas reglas, para que cada quien toque solo lo suyo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /perfiles/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Dos cosas que conviene saber

**El peso.** Un build de WebGL son varios megas. Por eso Unity se carga solo
en `/avatar` y en el resto de la app se muestra la miniatura: nadie espera
una descarga para ver una carita en la cabecera.

**El móvil.** Unity no da soporte oficial a WebGL en navegadores móviles.
Suele andar, pero consume memoria; si los niños entran desde tablet, hay que
probarlo ahí antes de darlo por hecho.
