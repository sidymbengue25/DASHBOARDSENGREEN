# 🔍 Guide de Débogage - Dashboard SENGREEN

## 🚨 "Je ne vois rien" - Solutions

### 1. Vérifier le serveur de développement
```bash
# Démarrer le serveur
npm run dev

# Vérifier que ça fonctionne
# Devrait afficher : Local: http://localhost:5173/
```

### 2. Ouvrir le bon URL
- **URL local** : http://localhost:5173/
- **Vérifier le port** dans le terminal
- **Actualiser la page** (Ctrl+R ou Cmd+R)

### 3. Vérifier la console du navigateur
- **Ouvrir DevTools** : F12 ou Cmd+Option+I
- **Onglet Console** : Rechercher erreurs en rouge
- **Onglet Network** : Vérifier les requêtes échouées

### 4. Problèmes courants et solutions

#### ❌ Écran blanc complet
**Causes possibles :**
- Erreur JavaScript bloquante
- Problème d'authentification
- Module manquant

**Solutions :**
```bash
# Nettoyer et redémarrer
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### ❌ Page de login qui boucle
**Cause :** Problème Firebase ou credentials
**Solution :**
1. Vérifier le fichier `.env` avec les clés Firebase
2. Ou désactiver temporairement l'auth dans `main.tsx`

#### ❌ Modules qui ne s'affichent pas
**Cause :** Erreur dans les imports ou components
**Solution :**
1. Vérifier la console pour erreurs
2. Tester un module simple d'abord

### 5. Tests étape par étape

#### Étape 1: Vérifier l'import des modules
```bash
# Vérifier que tous les fichiers existent
ls -la src/components/
```

#### Étape 2: Tester l'authentification
Si vous voyez un écran de login, utilisez :
- **Email** : admin@sengreen.com  
- **Mot de passe** : mp=12345678

#### Étape 3: Naviguer vers les modules
1. **Overview** : Page d'accueil avec KPIs
2. **SIG** : Module cartographique
3. **Densité** : Cartes de densité
4. **Typologie** : Classification des déchets
5. **Démographique** : Analyse démographique
6. **Comparaison** : Analyse temporelle
7. **Satellite** : Données satellitaires

### 6. Erreurs JavaScript communes

#### TypeError: Cannot read property 'map' of undefined
**Solution :**
```typescript
// Ajouter des valeurs par défaut
collectes?.map(...) || []
// ou
{collectes && collectes.map(...)}
```

#### Module not found
**Solution :**
```bash
# Vérifier les imports
npm run build
```

### 7. Problèmes spécifiques

#### 🗺️ Cartes Leaflet ne s'affichent pas
**Solutions :**
1. Vérifier que Leaflet CSS est importé
2. Nettoyer le cache navigateur
3. Vérifier la console pour erreurs tiles

#### 🔥 Firebase ne se connecte pas
**Solutions :**
1. Vérifier les clés Firebase dans `.env`
2. Vérifier la configuration réseau/firewall
3. Tester avec données mockées

#### 📊 Graphiques Recharts vides
**Solutions :**
1. Vérifier que les données existent
2. Vérifier le format des données
3. Ajouter des logs pour déboguer

### 8. Mode débogage avancé

#### Ajouter des logs de debug :
```typescript
// Dans useEffect des composants
console.log('Component mounted:', { collectes, depots })
console.log('Data loaded:', data)
```

#### Tester avec données mockées :
```typescript
// Remplacer temporairement par :
const mockData = [
  { id: 1, name: 'Test', value: 100 },
  { id: 2, name: 'Test 2', value: 200 }
]
```

### 9. Commandes utiles

```bash
# Vérifier les erreurs
npm run build

# Nettoyer complètement
rm -rf node_modules dist .vite
npm install

# Tester en mode production
npm run build
npm run preview
```

### 10. Où chercher de l'aide

1. **Console navigateur** : Erreurs JavaScript
2. **Terminal** : Erreurs de build/serveur  
3. **Onglet Network** : Problèmes de requêtes
4. **Onglet Elements** : Structure HTML généré

---

## 🎯 Checklist de débogage rapide

- [ ] Serveur démarré (`npm run dev`)
- [ ] URL correct (http://localhost:5173/)
- [ ] Console sans erreurs rouges
- [ ] Firebase configuré (si nécessaire)
- [ ] Modules importés correctement
- [ ] Données chargées (logs dans console)
- [ ] Navigation fonctionne (sidebar cliquable)

## 🆘 En cas d'urgence

Si rien ne fonctionne, utilisez cette version minimale pour tester :

```typescript
// Dans App.tsx, remplacer renderContent par :
const renderContent = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard SENGREEN</h1>
      <p>✅ Application fonctionne !</p>
      <p>Section active: {activeSection}</p>
    </div>
  )
}
```

Cela vous permettra de vérifier que la base fonctionne avant d'ajouter les modules complexes.
