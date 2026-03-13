<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VPO Digital (Team Workflow)

Bienvenidos al repositorio de **VPO Digital** con integración de motor de VPO, lógica de Supabase y pasarela de Stripe.

## Cómo levantar el proyecto localmente

Sigue estos pasos para obtener una copia local y ejecutar el entorno de desarrollo:

### 1. Variables de entorno (¡MUY IMPORTANTE!)
Por motivos de seguridad, los archivos `.env` (incluyendo las llaves de Supabase y Stripe) no están subidos al repositorio. 
**Debes solicitar el archivo `.env` por un canal seguro (ej: Slack, Discord, correo interno)** al administrador del proyecto antes de continuar. Una vez lo tengas, ubícalo en la raíz del proyecto.

### 2. Instalación de dependencias
Asegúrate de tener Node.js instalado. Luego ejecuta:
```bash
npm install
```

### 3. Ejecutar la aplicación
Una vez que las dependencias estén instaladas y el archivo `.env` configurado, lanza el entorno de desarrollo con:
```bash
npm run dev
```

Esto levantará la aplicación en el puerto asignado.
