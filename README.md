# Gestionnaire de Tâches Visa

Un gestionnaire de tâches synchronisé pour la vérification de documents de demande de visa. Synchronisation en temps réel entre tous vos appareils.

## Fonctionnalités

- ✅ Gestion de tâches avec catégories personnalisables
- 🔄 Synchronisation en temps réel entre appareils
- 🔐 Authentification sécurisée avec Supabase
- 📱 Interface responsive (mobile et desktop)
- 🎨 Design professionnel adapté au contexte administratif

## Installation

1. Clonez le repository
2. Installez les dépendances : `npm install`
3. Configurez Supabase (voir section Configuration)
4. Lancez en développement : `npm run dev`

## Configuration Supabase

1. Créez un projet Supabase
2. Exécutez les scripts SQL dans l'ordre :
   - `scripts/001_create_tables.sql`
   - `scripts/002_insert_default_categories.sql`
3. Ajoutez vos variables d'environnement Supabase

## Déploiement

Déployez facilement sur Vercel en connectant votre repository GitHub.

## Technologies

- Next.js 15
- Supabase (base de données et authentification)
- Tailwind CSS
- TypeScript
