# 🔒 Configuración BD Privada para Railway

## ❌ Problema: BD Local no funciona en Railway

Tu BD en XAMPP/phpMyAdmin está en `localhost` (tu PC). Railway está en la nube y **no puede acceder** a tu BD local.

## ✅ Soluciones para BD Privada

### Opción 1: Base de Datos Externa Gratuita
**Recomendado para testing:**

1. **PlanetScale** (gratuito, MySQL compatible)
   - Ve a https://planetscale.com
   - Crea cuenta gratuita
   - Crea una base de datos
   - Obtén las credenciales de conexión

2. **Railway MySQL** (privada en tu proyecto)
   - Ya tienes esta opción disponible
   - Los datos quedan en Railway (privados)

### Opción 2: Base de Datos en VPS/Cloud
**Para producción:**

1. **DigitalOcean Droplet** (~$6/mes)
2. **AWS Lightsail** (~$10/mes)
3. **Vultr** (~$5/mes)

### Opción 3: Base de Datos Local con Túnel
**Solo para desarrollo (no recomendado para prod):**

Usar ngrok o similar para exponer tu puerto 3306:
```bash
# Instalar ngrok
# Exponer puerto MySQL
ngrok tcp 3306
```

## 🚀 Configuración en Railway

Una vez tengas tu BD externa, configura estas variables en Railway:

```env
DB_HOST=tu-host-externo.com
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=cis_madrid
```

## 📋 Importar Datos

Después de configurar la BD externa:

1. **Conecta a tu BD externa** desde phpMyAdmin local
2. **Ejecuta el contenido de** `cis_madrid.sql`
3. **Verifica** que las tablas se crearon

¿Quieres que te ayude a configurar alguna de estas opciones?