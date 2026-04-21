# 🚂 Guía de Deployment en Railway

## ✅ Configuración actualizada para Railway MySQL

Tu proyecto ya está configurado para usar **Railway MySQL** (privada dentro de tu proyecto).

---

## ✅ Paso 1: Agregar MySQL a tu proyecto (si no lo tienes)

1. Ve a **Railway Dashboard** → Tu proyecto **superb-prosperity**
2. Haz clic en **+ New**
3. Selecciona **MySQL**
4. Railway creará automáticamente las variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

---

## ✅ Paso 2: Hacer push de los cambios

Los archivos ya están actualizados. Solo necesitas hacer push:

```bash
git add .
git commit -m "feat: configurar Railway MySQL privada con auto-inicialización"
git push
```

---

## ✅ Paso 3: Railway inicializará automáticamente la BD

Después del push, Railway:
1. **Desplegará** la aplicación
2. **Ejecutará** `api/init-db.sh` automáticamente
3. **Importará** `cis_madrid.sql` a la BD MySQL
4. **Iniciará** el healthcheck

---

## ✅ Verificar que funciona

1. Ve al dashboard → **Logs**
2. Deberías ver:
   ```
   🚀 Inicializando base de datos MySQL en Railway...
   ✅ Base de datos inicializada correctamente
   ✅ Conectado a MySQL → cis_madrid
   ✅ SMTP Gmail conectado → cismadrid23@gmail.com
   ```

3. Prueba los endpoints:
   ```bash
   curl https://superb-prosperity.up.railway.app/health
   → { "ok": true, "mensaje": "Servidor en funcionamiento" }

   curl https://superb-prosperity.up.railway.app/api/health
   → { "ok": true, "mensaje": "API CIS funcionando correctamente", "bd": "conectada" }
   ```

---

## 🔧 Variables de entorno adicionales (opcionales)

Si necesitas configurar email u otras opciones, ve a **Variables** en Railway:

```env
SMTP_USER=cismadrid23@gmail.com
SMTP_PASS=tu_contrasena_gmail
CORS_ORIGIN=https://superb-prosperity.up.railway.app
APP_URL=https://superb-prosperity.up.railway.app
```

---

## ⚠️ Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| `init-db.sh: command not found` | Script no ejecutable | Ya está arreglado en el código |
| `Access denied for user` | Credenciales MySQL | Verificar que MySQL esté agregado al proyecto |
| `Table already exists` | BD ya inicializada | Es normal en redeploys, ignora |
| `Healthcheck failure` | Servidor no inicia | Revisar logs de la aplicación |

---

## 📝 Archivos modificados

- `api/server.js` - Lee variables de Railway MySQL
- `railway.toml` - Configurado para auto-inicialización
- `api/init-db.sh` - Script de inicialización (nuevo)
- `api/.env.example` - Documentación actualizada
3. Pégalo y ejecuta

### Opción B: Crear un script de init (para futuros deploys)
1. Crea `api/init-db.sql` con la estructura
2. Agrega a `railway.toml`:
```toml
[deploy.postDeploy]
command = "mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < api/init-db.sql"
```

---

## ✅ Paso 4: Configurar Variables de Entorno

En el dashboard de Railway, sección **Variables**:

```env
PORT=3001
DB_HOST=$MYSQLHOST
DB_PORT=$MYSQLPORT
DB_USER=$MYSQLUSER
DB_PASSWORD=$MYSQLPASSWORD
DB_NAME=$MYSQLDATABASE
CORS_ORIGIN=https://tu-dominio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=cismadrid23@gmail.com
SMTP_PASS=tu_contrasena_gmail
CODE_PROFESIONAL=CIS-PRO-2026
APP_URL=https://superb-prosperity.up.railway.app
```

---

## ✅ Paso 5: Hacer Push y Redeploy

```bash
git add .
git commit -m "fix: configurar healthcheck y tolerancia a BD en Railway"
git push
```

Railway detectará el cambio y reiniciará automáticamente.

---

## 🔍 Verificar que funciona

1. Ve al dashboard → **Logs**
2. Deberías ver:
   ```
   ✅ Conectado a MySQL → cis_madrid
   ✅ SMTP Gmail conectado → cismadrid23@gmail.com
   ```

3. Prueba los endpoints:
   ```bash
   curl https://superb-prosperity.up.railway.app/health
   → { "ok": true, "mensaje": "Servidor en funcionamiento" }
   
   curl https://superb-prosperity.up.railway.app/api/health
   → { "ok": true, "mensaje": "API CIS funcionando correctamente", "bd": "conectada" }
   ```

---

## ⚠️ Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| `ECONNREFUSED :1:3306` | BD no conectada | Agregar MySQL desde Railway + configurar vars |
| `Healthcheck failure` | `/health` no responde | Comprobar que servidor escucha en `0.0.0.0:PORT` |
| `ENETUNREACH` (SMTP) | Sin credenciales SMTP | Agregar `SMTP_USER` y `SMTP_PASS` a Variables |
| `Connection timeout` | Credenciales incorrectas | Verificar `DB_USER`, `DB_PASSWORD` |

---

## 📝 Referencias

- [Railway Docs - Environment Variables](https://docs.railway.app/guides/variables)
- [Railway Docs - MySQL](https://docs.railway.app/plugins/mysql)
- [railway.toml Reference](https://docs.railway.app/reference/railway-toml)
