# Instrucciones para desplegar en Vercel

## Configuración Rápida

Este proyecto está configurado para desplegarse como una **aplicación completa** en Vercel (frontend + backend).

### Pasos para desplegar:

1. **Instala Vercel CLI (opcional, o usa el dashboard)**
   ```bash
   npm install -g vercel
   ```

2. **Conecta tu repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Add New Project"
   - Importa tu repositorio de GitHub

3. **Configura las variables de entorno en Vercel**
   
   En el dashboard de Vercel, ve a "Settings" → "Environment Variables" y agrega:
   
   ```
   DATABASE_URL=tu_connection_string_de_neon
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=tu_contraseña_segura
   ```

4. **Configura el frontend para usar la API de Vercel**
   
   Crea un archivo `.env.production` en la raíz del proyecto:
   ```
   VITE_API_BASE_URL=/api
   ```

5. **Despliega**
   ```bash
   vercel
   ```
   
   O simplemente haz push a tu rama principal si conectaste el repositorio.

## Estructura del Proyecto

```
/
├── api/              # Backend serverless (Express)
│   └── index.js
├── src/              # Frontend (React + Vite)
├── dist/             # Build del frontend (generado)
├── vercel.json       # Configuración de Vercel
└── package.json      # Dependencias compartidas
```

## Cómo funciona

- **Frontend**: Se construye con `vite build` → carpeta `dist/`
- **Backend**: Se ejecuta como función serverless en `/api/*`
- **Routing**: Vercel redirige `/api/*` al backend y todo lo demás al frontend

## Desarrollo local

Para desarrollo local, sigue usando:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd server
npm run dev
```

## Notas Importantes

- ✅ El backend en `/api` es una versión serverless del código en `/server`
- ✅ Las funciones serverless de Vercel tienen límite de 10 segundos por request
- ✅ La base de datos Neon funciona perfectamente con Vercel
- ✅ Los archivos estáticos (PDFs, imágenes) deben estar en servicios externos (no en Vercel)

## Solución de Problemas

**Error: "Database not configured"**
- Verifica que agregaste `DATABASE_URL` en las variables de entorno de Vercel

**Error 504 Gateway Timeout**
- Las funciones serverless tienen límite de tiempo. Optimiza las consultas a la DB.

**Frontend no se conecta a la API**
- Asegúrate de que `VITE_API_BASE_URL=/api` esté configurado

## Alternativa: Dos proyectos separados

Si prefieres desplegar por separado:

### Backend en Vercel:
1. Crea un proyecto nuevo solo con la carpeta `/server`
2. Usa el mismo `vercel.json` pero apuntando a `server/index.js`

### Frontend en Vercel/Netlify:
1. Configura `VITE_API_BASE_URL=https://tu-backend.vercel.app`
2. Despliega solo el frontend

**Ventaja**: Mayor control y escalabilidad
**Desventaja**: Necesitas manejar CORS y dos deployments
