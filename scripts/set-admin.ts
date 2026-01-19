import { initAdmin } from "../lib/firebase-admin";
import * as dotenv from "dotenv";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

async function setRole(email: string, role: string) {
    if (!email || !role) {
        console.error("Uso: npx tsx scripts/set-admin.ts <email> <role>");
        process.exit(1);
    }

    try {
        const adminApp = await initAdmin();
        const auth = adminApp.auth();

        const user = await auth.getUserByEmail(email);

        // Asignar Custom Claims
        await auth.setCustomUserClaims(user.uid, { role });

        console.log(`✅ ÉXITO: Rol '${role}' asignado a ${email}`);
        console.log(`ℹ️  El usuario debe cerrar e iniciar sesión nuevamente para actualizar sus permisos.`);

        // Verificar
        const updatedUser = await auth.getUser(user.uid);
        console.log("Claims actuales:", updatedUser.customClaims);

        process.exit(0);
    } catch (error) {
        console.error("❌ ERROR:", error);
        process.exit(1);
    }
}

// Obtener argumentos
const args = process.argv.slice(2);
const email = args[0];
const role = args[1] || "admin";

setRole(email, role);
