# KLIMB RUN

## Embed Webflow permanent

Coller une seule fois dans un bloc Code Embed, puis publier Webflow :

```html
<script src="https://sholy-klimb.github.io/KLIMB-404/embed.js" defer></script>
```

Jeu : https://sholy-klimb.github.io/KLIMB-404/

## Classement mondial

Les scores sont persistés dans une base D1 hébergée via Sites, sans Supabase ni compte joueur. Le score comprend la distance et les bonus. À la fin d'une partie entrant dans le Top 5, le joueur saisit un pseudo de 2 à 16 caractères. Le classement est disponible avant et après la partie, jamais pendant le jeu ni la pause. Le record personnel reste local au navigateur.

Service : https://klimb-run-scores.classy-rain-3427.chatgpt.site
Modération : https://klimb-run-scores.classy-rain-3427.chatgpt.site/admin

Seul le propriétaire peut accéder à la modération en se connectant avec son compte ChatGPT. Il peut masquer/restaurer les entrées et exporter un CSV. Les joueurs ne se connectent jamais. Les scores ne sont pas écrits dans ce dépôt GitHub.

Le service vérifie les sessions, la durée, les scores manifestement impossibles, les pseudos, les doubles soumissions et limite la fréquence. Un jeu exécuté côté navigateur n'offre pas une garantie anti-triche absolue. Les égalités conservent le score enregistré le premier.

## Mises à jour

Modifier `build/klimb-embed.source.html`, lancer `npm ci && npm run build`, puis committer le source, `klimb-jeu-embed-webflow.html` et `build/optimization.json`. GitHub Pages publie main. Les visiteurs voient les changements après publication et rafraîchissement, sans remplacer l'embed Webflow.

Le backend est géré dans le dépôt source du Site KLIMB RUN · Classement mondial. Les anciens fichiers supabase/ proviennent de l'archive initiale, ne sont pas déployés et ne sont pas utilisés.
