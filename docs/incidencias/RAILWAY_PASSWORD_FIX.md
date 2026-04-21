# 🔐 Cómo configurar MYSQLPASSWORD en Railway

## El Problema
```
Access denied for user 'root'@'...' (using password: NO)
```
Significa que **no hay contraseña**. En Railway tienes que hacerlo en dos pasos:

---

## PASO 1️⃣: Obtener la contraseña del servicio MySQL

### En Railway Dashboard:

1. **Abre** https://railway.app/dashboard
2. **Selecciona proyecto:** CIS2026
3. **Haz clic en el servicio MySQL** (no Node.js, MySQL)

   ![En el panel central verás dos servicios: uno dice "Node" y otro "MySQL"]

4. **Busca la pestaña "Variables"** (al lado de "Settings", "Logs", etc.)

5. **Verás algo como esto:**
   ```
   MYSQLHOST = mysql.railway.internal
   MYSQLPORT = 3306
   MYSQLUSER = root
   MYSQLPASSWORD = AQUI_VA_LA_CONTRASEÑA_LARGA
   MYSQLDATABASE = railway
   ```

6. **Copia el valor completo** de `MYSQLPASSWORD` 
   - Por ejemplo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - Cópialo exactamente, sin espacios ni comillas

---

## PASO 2️⃣: Configurar la contraseña en Node.js

### En Railway Dashboard:

1. **Vuelve a tu proyecto:** CIS2026
2. **Ahora haz clic en el servicio Node.js** (el que tiene tu API)

   ![Debería decir algo como "Node" o "API" o el nombre que le pusiste]

3. **Busca la pestaña "Variables"** (igual que antes)

4. **Si ya tiene variables, verás:**
   ```
   MYSQLHOST = mysql.railway.internal
   MYSQLPORT = 3306
   MYSQLUSER = root
   MYSQLDATABASE = railway
   [AQUI FALTA MYSQLPASSWORD]
   ```

5. **Scroll hacia abajo y busca "Add Variable"** o un botón `+`

6. **Rellena así:**
   - **Key:** `MYSQLPASSWORD`
   - **Value:** `[PEGÁ LO QUE COPIASTE DEL PASO 1]`

7. **Haz clic en "Save"** o similar

---

## PASO 3️⃣: Redeploy

1. **Sigue en el servicio Node.js**
2. **Busca el botón "Redeploy"** o "Deploy" (esquina superior derecha)
3. **Haz clic**
4. **Espera** a que se complete (verás "Running" en verde)

---

## PASO 4️⃣: Verifica los logs

1. **En el servicio Node.js, busca "Logs"**
2. **Scroll hacia arriba en los logs**
3. **Busca esta sección:**
   ```
   [MYSQL CONFIG] Variables detectadas:
     MYSQLPASSWORD: ✓ set (length: 32)
   ```

4. **Si dice `✓ set (length: XX)` → CORRECTO!**
5. **Si dice `✗ not set` → IR AL PASO 2 NUEVAMENTE**

---

## ⚠️ Troubleshooting

### "Aún dice (using password: NO)"
1. Verifica que la variable está guardada (haz refresh de la página)
2. Verifica que COPIASTE TODO EL PASSWORD (a veces hay espacios ocultos)
3. Intenta copiar nuevamente desde MySQL

### "Dice: ✓ set pero siguen los errores"
- La contraseña puede ser incorrecta
- Verifica que copiaste EXACTAMENTE lo que dice en MySQL
- Sin espacios, sin comillas, sin nada extra

### "No veo dónde está MYSQLPASSWORD en el servicio MySQL"
1. Haz clic en servicio MySQL
2. Pestaña "Variables"
3. Si ves poco, intenta **conectar como referencia**:
   - A veces Railway lo muestra como `DATABASE_URL` en lugar de 5 variables separadas
   - Si ves algo como: `mysql://root:PASSWORD@mysql.railway.internal:3306/railway`
   - El PASSWORD va entre `:` y `@`

---

## Alternativa: Si DATABASE_URL existe

Si en MySQL ves:
```
DATABASE_URL = mysql://root:PASSWORD123@mysql.railway.internal:3306/railway
```

Entonces en Node.js configura directamente:
```
MYSQLPASSWORD = PASSWORD123
```

(Lo que hay entre `:` y `@` en el DATABASE_URL)

---

## Checklist Final

- [ ] Fui a MySQL → Variables
- [ ] Copié MYSQLPASSWORD exactamente
- [ ] Fui a Node.js → Variables
- [ ] Pegué MYSQLPASSWORD en Node.js
- [ ] Hice clic "Save"
- [ ] Hice "Redeploy"
- [ ] Los logs muestran "✓ set (length: XX)"
- [ ] El error dice "✅ Conectado a MySQL" en los logs

---

**Si sigue sin funcionar**, pégame una captura de los logs después del redeploy.
