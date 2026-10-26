# KLIMB RUN — page 404 Webflow

Jeu responsive autonome, personnage pixel K corrigé sur mobile, six difficultés et décors progressifs. Le top 5 partagé est préparé, mais aucun service Supabase n’est connecté ou déployé dans cette livraison.

## À intégrer dans Webflow

Copier **tout le contenu de `klimb-jeu-embed-webflow.html`** dans un élément Code Embed sur la page 404. Le conteneur doit occuper 100 % de la largeur disponible, sans hauteur fixe. CSS, JavaScript, police et sprites sont inclus. Utiliser une seule instance du jeu par page. Tester sur le site publié.

Le fichier HTML fourni peut aussi être ouvert directement pour prévisualiser le jeu. Le classement en ligne nécessite un domaine HTTP(S) autorisé et sa configuration serveur.

## À déposer dans GitHub

Déposer le contenu de ce dossier à la racine du dépôt, y compris `.gitignore`. Ne pas ajouter de clés secrètes ni `node_modules`. Cette archive ne crée pas de dépôt et ne publie rien sur GitHub.

- `klimb-jeu-embed-webflow.html` : version optimisée livrable, environ 44 Ko.
- `build/klimb-embed.source.html` : source lisible à modifier.
- `build/optimize.cjs` : génération et optimisation de l’embed.
- `supabase/migrations/20261026000000_klimb_scores.sql` : base du classement.
- `supabase/functions/klimb-scores/index.ts` : API du classement.
- `supabase/config.toml` : configuration de la fonction publique.
- `docs/INSTALLATION-CLASSEMENT.md` : installation, fonctionnement et limites.

## Modifier et reconstruire

Avec Node.js 22.12 ou supérieur :

```sh
npm install
npm run build
```

Conserver le `package-lock.json` créé par l’installation dans Git pour figer les dépendances transitives. Les versions directes sont déjà fixées dans `package.json`.

Modifier le source lisible puis reconstruire. Le build recrée le HTML racine et vérifie la conversion sans perte du sprite. Il ne demande aucun compte ni secret. Ne pas modifier uniquement le HTML optimisé si la modification doit survivre au prochain build.

## Activer le top 5

Suivre `docs/INSTALLATION-CLASSEMENT.md`. Le développeur doit créer/configurer un projet Supabase, appliquer le SQL et déployer la fonction. Remplacer ensuite `data-score-api=""` dans le source par l’URL de la fonction, reconstruire et recoller l’embed dans Webflow. Aucune clé privée ne doit être placée dans l’embed.

Le score est calculé par le jeu ; seuls les joueurs qualifiés peuvent saisir un pseudo. Le serveur revérifie la place lors de la soumission. Git héberge le code ; Supabase stocke les scores des visiteurs.

## Vérification

Le jeu a été vérifié dans Chrome sur sept tailles d’écran, ainsi que pour le saut, la pause, la reprise et la collision. Le parcours du classement a été vérifié avec un serveur simulé. La correction mobile supprime le passage du personnage par le tampon basse résolution du décor. La recette Supabase et les tests sur téléphones réels restent à effectuer après déploiement.
