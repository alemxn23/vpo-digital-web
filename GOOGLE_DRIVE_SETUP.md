# Guía Definitiva de Configuración: Google Drive API para VPO Digital

Esta guía paso a paso te permitirá resolver los problemas de conexión con Google Drive ("Error 400: redirect_uri_mismatch" y "Acceso bloqueado: VPO no completó verificación") y dejar tu aplicación funcionando perfectamente.

## Paso 1: Crear Proyecto en Google Cloud

1.  Ve a [Google Cloud Console](https://console.cloud.google.com/).
2.  Si es tu primera vez, acepta los términos de servicio.
3.  Arriba a la izquierda, haz clic en el selector de proyectos (probablemente diga "Seleccione un proyecto").
4.  Haz clic en **"PROYECTO NUEVO"**.
5.  **Nombre del proyecto**: `VPO Digital` (o el que prefieras).
6.  Haz clic en **"CREAR"**. Espera unos segundos a que se cree y **asegúrate de seleccionarlo** una vez creado (debe aparecer el nombre arriba).

## Paso 2: Habilitar la API de Google Drive (¡IMPORTANTE!)

1.  Ve directamente a este enlace: [https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=147428616428](https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=147428616428)
    *   *(Nota: Asegúrate de estar usando la cuenta de Google correcta en la esquina superior derecha).*
2.  Si el botón dice **"HABILITAR"**, haz clic en él.
3.  Si ya está habilitada, verás un botón que dice "Gestionar". En ese caso, el problema podría ser que tardó en propagarse o necesitas revisar el Paso 4.

## Paso 3: Configurar la Pantalla de Consentimiento (OAuth Consent Screen)

1.  En el menú de la izquierda, ve a **"Pantalla de consentimiento de OAuth"**.
2.  **User Type (Tipo de usuario)**: Selecciona **"Externo"** (External).
3.  Haz clic en **"CREAR"**.
4.  **Información de la aplicación**:
    *   **Nombre de la app**: `VPO Digital`.
    *   **Correo de asistencia**: `mcfidel98@gmail.com`
    *   **Logotipo**: (Opcional, puedes dejarlo vacío).
    *   **Datos de contacto del desarrollador**: `mcfidel98@gmail.com`
5.  Haz clic en **"GUARDAR Y CONTINUAR"**.
6.  **Permisos (Scopes)**:
    *   Haz clic en **"AGREGAR O QUITAR ALCANCES"**.
    *   En el filtro busca: `drive.file`
    *   Selecciona la casilla que dice: `.../auth/drive.file` (Ver, editar, crear y borrar solo los archivos específicos de Google Drive que use esta aplicación).
    *   Haz clic en "ACTUALIZAR" y luego en **"GUARDAR Y CONTINUAR"**.
7.  **Usuarios de prueba (Test Users) - ¡CRUCIAL!**:
    *   Haz clic en **"+ ADD USERS"** (Agregar usuarios).
    *   Escribe tu correo: `mcfidel98@gmail.com`
    *   (Agrega aquí los correos de cualquier otro médico que vaya a probar la app).
    *   Haz clic en **"AGREGAR"** y luego en **"GUARDAR Y CONTINUAR"**.

## Paso 4: Crear Credenciales (Client ID)

1.  En el menú de la izquierda, ve a **"Credenciales"**.
2.  Arriba, haz clic en **"+ CREAR CREDENCIALES"** > **"ID de cliente de OAuth"**.
3.  **Tipo de aplicación**: Selecciona **"Aplicación web"**.
4.  **Nombre**: `Cliente Web VPO` (o lo que gustes).
5.  **Orígenes autorizados de JavaScript** (Authorized JavaScript origins):
    *   Haz clic en **"AGREGAR URI"**.
    *   Debes poner **EXACTAMENTE** la dirección donde corre tu app.
    *   Si es local: `http://localhost:5173`
    *   Si es producción: `https://vpo.mx`
    *   *Nota: No pongas barra `/` al final.*
6.  Haz clic en **"CREAR"**.
7.  Aparecerá una ventana con tu **ID de cliente**. Copia la cadena larga que termina en `.apps.googleusercontent.com`.

## Paso 5: Conectar la App con el Nuevo ID

Tienes dos formas de hacer esto. Recomendamos la **Opción B** para que sea permanente.

### Opción A: Configuración Rápida (Desde la Pantalla de VPO)
1. Abre tu aplicación VPO en el navegador.
2. Navega hasta el paso 5 (Reporte).
3. Abajo de los botones, haz clic en el enlace pequeño **"Configurar Google ID"**.
4. Pega el ID que copiaste en el Paso 4.
5. Acepta.

### Opción B: Configuración Permanente (En Código)
1. Abre el archivo `App.tsx` en tu editor de código.
2. Busca la línea ~34 donde dice:
   ```typescript
   const DEFAULT_CLIENT_ID = '...';
   ```
3. Reemplaza el valor viejo por tu NUEVO Client ID:
   ```typescript
   const DEFAULT_CLIENT_ID = 'PEGA_AQUI_TU_NUEVO_ID.apps.googleusercontent.com';
   ```
4. Guarda el archivo. Si el servidor local está corriendo, se actualizará solo.

## ¡Listo!
Ahora cuando hagas clic en el botón "DRIVE":
1. Te pedirá iniciar sesión con Google.
2. Te mostrará una advertencia de "Google no ha verificado esta app" (esto es normal en modo prueba).
3. Haz clic en **"Continuar"** o **"Configuración avanzada" > "Ir a VPO (inseguro)"**.
4. Acepta los permisos.
5. ¡El PDF se subirá a tu Drive en la carpeta `VPO_Expedientes_MedicinaInterna`!
