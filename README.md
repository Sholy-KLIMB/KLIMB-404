# KLIMB RUN

## Intégration Webflow permanente

Coller une seule fois dans un Code Embed :

```html
<script src="https://sholy-klimb.github.io/KLIMB-404/embed.js" defer></script>
```

Le script affiche le jeu dans une iframe et ajuste automatiquement sa hauteur. Tester sur le site Webflow publié. Le jeu est chargé depuis GitHub Pages : les mises à jour du dépôt apparaissent après le déploiement Pages et le rafraîchissement du visiteur, sans changer le bloc Webflow.

## Modifier le jeu

Modifier `build/klimb-embed.source.html`, exécuter `npm ci && npm run build`, puis committer le source, `klimb-jeu-embed-webflow.html` et `build/optimization.json`. Le fichier `index.html` charge automatiquement la version publiée de l’embed. GitHub Pages publie la branche main à la racine.

## Classement : état réel

Le panneau Top 5 est disponible avant et après une partie. Il reste masqué pendant le jeu et la pause. Les scores des visiteurs ne sont pas encore enregistrés : aucun backend n’est configuré. Le record personnel est conservé dans le navigateur lorsque son stockage est autorisé.

GitHub Pages héberge des fichiers statiques et ne reçoit pas les scores anonymes. Le code Supabase fourni dans l’archive est conservé à titre de référence mais n’est ni déployé ni requis pour le jeu. Une solution de collecte et modération doit être choisie avant d’activer le classement partagé. Ne jamais intégrer de jeton GitHub privé dans le jeu.
