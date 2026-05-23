# 🛡️ Audit Complet & Roadmap : NEXCODE3 (AI Studio Applet)

## 1. Analyse Architecturale (Audit)

### 🚨 Points Critiques
*   **Monolithe UI** : Le fichier `app/page.tsx` (> 2000 lignes) est un "God Object" qui gère trop de responsabilités (Terminal, Éditeur, Chat, Kanban, Marketplace).
*   **Workflow "Monkey-Patch"** : L'utilisation de scripts `fix-*.js` basés sur des Regex pour modifier le code source est extrêmement fragile et empêche une maintenance saine.
*   **Incompatibilité Mobile (API)** : Les routes `app/api/*` ne fonctionnent pas en export statique (APK). La logique de communication avec les IA doit être migrée côté client.
*   **Gestion d'État** : L'utilisation massive de `useState` (> 50 instances) dans un seul composant provoque des re-renders inutiles et dégrade les performances mobiles.

### 🏗️ Structure Core
*   Le workspace Rust (`core/`) est puissant mais semble sous-exploité ou mal intégré au cycle de vie React.
*   L'override `node-domexception` dans `package.json` indique des hacks de compatibilité qui pourraient être résolus proprement.

---

## 2. 📝 TODO List des Correctifs (Roadmap)

### Phase 1 : Décomposition & Refactoring (Priorité : Critique)
- [ ] **Composantisation** : Extraire les modules suivants de `app/page.tsx` :
    - `EditorContainer.tsx` : Gestion de Monaco et de la vue split.
    - `TerminalSystem.tsx` : Logique du shell et historique.
    - `OrchestratorPanel.tsx` : Interface de chat IA et prévisualisation des refactors.
    - `ProjectManagement.tsx` : Vues Kanban et Listes de tâches.
- [ ] **Migration d'État** : Implémenter **Zustand** pour centraliser l'état (Fichiers, Auth GitHub, Clés API).
- [ ] **Suppression des Scripts de Patch** : Intégrer les fonctionnalités de `fix-rnd.js` et `apply-upgrades.js` directement dans le code source et supprimer les fichiers `.js` à la racine.

### Phase 2 : Optimisation Mobile & Capacitor (Priorité : Haute)
- [ ] **Migration Client-Side** : Réécrire les services de chat pour utiliser les SDKs (Google GenAI, Anthropic) directement depuis le navigateur/mobile sans passer par `/api`.
- [ ] **Sécurité des Clés** : Implémenter un stockage sécurisé pour les clés API (via Capacitor Preferences ou chiffrement local).
- [ ] **Adaptabilité UI** : Ajuster les composants `Rnd` (drag/resize) pour une meilleure ergonomie tactile sur petits écrans.

### Phase 3 : Performance & Core Logic (Priorité : Moyenne)
- [ ] **Intégration WASM** : Compiler les modules Rust (`nexus-crypto`, `nexus-parser`) en WebAssembly pour les exécuter nativement dans l'APK.
- [ ] **Persistance Robuste** : Améliorer la synchronisation avec `idb-keyval` pour éviter les pertes de données lors de la fermeture de l'app.

### Phase 4 : Expérience Utilisateur (Priorité : Basse)
- [ ] **Mode Offline** : Permettre l'accès aux fichiers et à l'édition de base sans connexion internet.
- [ ] **Polissage Graphique** : Unifier le thème (Gradients, flous de background) et ajouter des animations de transition fluides entre les onglets.

---

*Date de l'audit : 23 Mai 2026*
*Statut : Planification terminée*
