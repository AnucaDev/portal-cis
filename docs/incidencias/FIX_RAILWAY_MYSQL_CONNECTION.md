# 🔧 Solucionar Error de Conexión MySQL en Railway

## Problema Detectado
```
[INICIAR SESIÓN] Error: getaddrinfo ENOTFOUND mysql.railway.internal
```
**Significado:** El servidor Node.js no puede resolver el nombre `mysql.railway.internal` porque **MySQL no está correctamente linkado** a tu servicio Node.js.

---

## Solución Paso a Paso

### **PASO 1: Verificar que MySQL está corriendo**

1. Ve a https://railway.app/dashboard
2. Selecciona tu proyecto **CIS2026**
3. Haz clic en el servicio **MySQL** (si no lo ves, hay que crearlo)
4. Verifica que el estado es **"Running"** (verde) en la esquina superior derecha
5. Si está rojo o detenido, haz clic en el botón de play para iniciarlo

---

### **PASO 2: Linkear MySQL con Node.js (CRÍTICO)**

Esto es lo más importante. El error ocurre porque MySQL está aislado.

#### Opción A: Desde el dashboard (más fácil)

1. Abre tu proyecto CIS2026
2. Haz clic en tu servicio **Node.js** (el que ejecuta la API)
3. En el panel derecho, busca **"Links"** o **"Connections"** (sección inferior)
4. Verás un botón tipo **"+ Add Connection"** o **"Link Service"**
5. Selecciona **MySQL** de la lista
6. Railway generará automáticamente las variables de entorno:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

#### Opción B: Manual desde Variables

Si no aparece la opción de "Link", hazlo manualmente:

1. En tu servicio **Node.js**, ve a **"Variables"**
2. Añade estas 5 líneas exactamente:

```
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=[COPIA EL PASSWORD EXACTO DEL SERVICIO MYSQL]
MYSQLDATABASE=cis_madrid
```

**Para obtener el PASSWORD:**
1. Haz clic en el servicio **MySQL**
2. Ve a **"Variables"** 
3. Busca la variable que dice algo como `MYSQLPASSWORD` o `PASSWORD`
4. Cópiala exactamente (sin comillas, sin espacios)

---

### **PASO 3: Verificar que el Database SQL se importó correctamente**

1. En el servicio **MySQL**, ve a la pestaña **"Data"** (si existe)
2. Verifica que aparecen las tablas:
   - `usuarios`
   - `pacientes`
   - `consentimientos`
   - etc.

Si NO ves las tablas:
1. El script `api/init-db.sh` no se ejecutó
2. Hay que importar manualmente el SQL:

```bash
# Desde terminal:
mysql -h mysql.railway.internal -u root -p[PASSWORD] railway < cis_madrid.sql
```

---

### **PASO 4: Re-desplegar la app**

Después de hacer cualquier cambio:

1. En Railway, haz clic en tu servicio **Node.js**
2. Busca el botón **"Redeploy"** o **"Deploy"** (esquina superior)
3. Haz clic para iniciar un nuevo despliegue
4. Espera a que se complete (verás "Success" en verde)

---

### **PASO 5: Probar la conexión**

Una vez desplegado, prueba estos endpoints:

#### Test 1: API activa
```
GET https://TU-DOMINIO-EN-RAILWAY.railway.app/health
```
Debe devolver:
```json
{
  "ok": true,
  "mensaje": "Servidor en funcionamiento"
}
```

#### Test 2: Diagnóstico (ver variables)
```
GET https://TU-DOMINIO-EN-RAILWAY.railway.app/api/diagnostico
```
Debe devolver algo como:
```json
{
  "mysql": {
    "host_usado": "mysql.railway.internal",
    "port_usado": 3306,
    "user_usado": "root",
    "database_usado": "railway",
    "passwordConfigured": true
  }
}
```

**Si `host_usado` es `localhost`, algo está mal en las variables.**

#### Test 3: Intenta registrar un usuario
```bash
curl -X POST https://TU-DOMINIO-EN-RAILWAY.railway.app/api/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "User",
    "email": "test@example.com",
    "telefono": "612345678",
    "password": "password123"
  }'
```

---

## Checklist de Verificación

- [ ] MySQL está en estado "Running" (verde)
- [ ] MySQL está **linkado** al servicio Node.js en "Links"
- [ ] Las 5 variables MySQL están definidas en Node.js:
  - [ ] `MYSQLHOST` = `mysql.railway.internal`
  - [ ] `MYSQLUSER` = `root`
  - [ ] `MYSQLPASSWORD` = [PASSWORD EXACTO]
  - [ ] `MYSQLDATABASE` = `railway`
- [ ] He hecho "Redeploy" después de cambios
- [ ] El endpoint `/api/diagnostico` muestra `host_usado: "mysql.railway.internal"`
- [ ] El comando `init-db.sh` se ejecutó y las tablas existen

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `ENOTFOUND mysql.railway.internal` | MySQL no linkado | Linkear MySQL en Dashboard |
| `ECONNREFUSED localhost:3306` | Leyendo variable `localhost` en lugar de `mysql.railway.internal` | Verificar que `MYSQLHOST` está configurada |
| `Access denied for user 'root'` | Password incorrecto | Copiar exactamente el PASSWORD del servicio MySQL |
| `database "railway" does not exist` | Nombre de BD incorrecto | Cambiar `MYSQLDATABASE` al nombre correcto |
| `SMTP no disponible` | Credenciales Gmail no configuradas | No es crítico para registro, pero: configurar `SMTP_USER` y `SMTP_PASS` |

---

## Contacto en Railway

Si nada funciona:

1. Abre la consola de Railway: https://railway.app/dashboard
2. Selecciona tu proyecto
3. Ve a **"Settings"** → **"Logs"**
4. Copia el error exacto y comparte la captura

---

**Actualizado:** 16/04/2026
