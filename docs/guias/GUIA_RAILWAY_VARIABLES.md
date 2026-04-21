# 🚀 Configurar Variables de Entorno en Railway

## Paso 1: Ir al panel de Railway

1. Abre https://railway.app/dashboard
2. Selecciona tu proyecto **CIS2026**
3. Verás dos servicios: uno para la app Node.js y otro para MySQL

---

## Paso 2: Encontrar credenciales de MySQL

### Opción A: Desde el servicio MySQL
1. Haz clic en el **servicio MySQL** (el que dice "MySQL")
2. Ve a la pestaña **"Variables"** 
3. Verás algo como:

```
MYSQLHOST = mysql.railway.internal
MYSQLPORT = 3306
MYSQLUSER = root
MYSQLPASSWORD = xxxxxxxxxxxx
MYSQLDATABASE = cis_madrid
```

**O verás una cadena única tipo:**
```
DATABASE_URL = mysql://root:password@mysql.railway.internal:3306/cis_madrid
```

### Opción B: Desde el servicio Node.js
1. Haz clic en el **servicio Node.js** (tu API)
2. Ve a **"Variables"**
3. Si MySQL está bien linkado, verás las variables ya generadas automáticamente

---

## Paso 3: Copiar exactamente estas 5 variables

En el servicio **Node.js**, ve a **"Variables"** y añade:

```
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=[COPIA EL PASSWORD EXACTO]
MYSQLDATABASE=cis_madrid
```

⚠️ **IMPORTANTE:**
- `MYSQLHOST` normalmente es `mysql.railway.internal` (NO localhost)
- El `MYSQLPASSWORD` debe ser **exacto** (sin comillas, sin espacios)
- El `MYSQLDATABASE` por defecto es `cis_madrid` para este proyecto, porque el esquema SQL crea esa base de datos.

---

## Paso 4: Re-deploy

1. Después de añadir las variables, Railway detectará cambios
2. Hará un nuevo deploy automáticamente
3. Revisa los logs para ver si aparece:
   ```
   [INIT] Conectando a MySQL: root@mysql.railway.internal:3306/railway
   ✅  Conectado a MySQL → railway
   ```

---

## Paso 5: Si sigue fallando

Si después del deploy siguen los errores `ECONNREFUSED`, ve a **"Logs"** y busca:

```
[INIT] Conectando a MySQL:
```

Copia el mensaje exacto y dime qué dice.

---

## Comandos alternativos (si necesitas verificar desde CLI)

Desde terminal, si Railway CLI está instalado:

```bash
railway link
railway vars
```

Esto te muestra las variables actuales del deploy.

---

**¿Ya lo hiciste? Dime qué ves en los logs después del re-deploy.**
