---
description: Estrategia de Flujo de Trabajo Git "La Cocina vs El Restaurante" para despliegues limpios.
---

# Estrategia Git: La Cocina vs El Restaurante

Este documento detalla la estrategia de gestión de ramas para mantener un historial limpio en producción.

## 1. Las Ramas

### 👨‍🍳 desarrollo (La Cocina)
- **Rol**: Área de trabajo diario.
- **Estado**: Caótico, experimental.
- **Uso**: Commits frecuentes ("fix", "wip"). Es el historial forense.

### 🍽️ despliegue (El Restaurante)
- **Rol**: Código en Producción.
- **Estado**: Impecable, estable.
- **Reglas**: 1 Versión = 1 Commit. No entran arreglos rápidos sueltos.

### 🏦 main (La Bóveda)
- **Rol**: Historial histórico inmutable.
- **Uso**: Copia fiel de versiones consagradas.

## 2. Flujo de Trabajo (Paso a Paso)

### A. Trabajo Diario (En la Cocina)
```bash
git checkout desarrollo
# ... realizar cambios ...
git add .
git commit -m "mensaje descriptivo o rápido"
git push origin desarrollo
```

### B. El Lanzamiento (Servir el Plato)
Cuando `desarrollo` está listo para producción:

1. Ir a la rama de producción:
   ```bash
   git checkout despliegue
   ```

2. **Merge Squash** (Traer cambios limpios):
   ```bash
   git merge --squash desarrollo
   ```

3. Crear el Commit de Release:
   ```bash
   git commit -m "Release vX.X.X: Descripción de las nuevas funciones"
   ```

4. Subir a Producción:
   ```bash
   git push origin despliegue
   ```

## 3. Comandos de Emergencia
Si `despliegue` se ensucia y necesita reinicio total desde el código actual:

```bash
git checkout --orphan temp_clean
git add .
git commit -m "Release vX.X.X: Clean Start"
git branch -D despliegue
git branch -m despliegue
git push origin despliegue --force
```
