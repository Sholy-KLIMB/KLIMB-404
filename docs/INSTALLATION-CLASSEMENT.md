# KLIMB RUN — installation du top 5 partagé

Le jeu mobile est prêt. Le classement global nécessite un projet Supabase et le déploiement ci-dessous : aucun service n’est encore connecté dans le HTML livré. Sans configuration, le jeu fonctionne et affiche « Classement en cours d’activation. ».

## Fichiers

- `klimb-jeu-embed-webflow.html` : bloc à coller dans un Code Embed Webflow, CSS, JS et images inclus.
- `build/klimb-embed.source.html` : version lisible pour maintenance.
- `supabase/migrations/20261026000000_klimb_scores.sql` : tables et fonctions de classement.
- `supabase/functions/klimb-scores/index.ts` : fonction serveur Supabase `klimb-scores`.

## Installation par le développeur

1. Créer un projet Supabase sur le compte de KLIMB. Dans son SQL Editor, exécuter `supabase/migrations/20261026000000_klimb_scores.sql`.
2. Créer une Edge Function nommée `klimb-scores` avec le contenu de `supabase/functions/klimb-scores/index.ts`. Désactiver la vérification JWT pour cette fonction publique. Avec la CLI, placer le fichier dans `supabase/functions/klimb-scores/index.ts`, puis déployer avec `supabase functions deploy klimb-scores --no-verify-jwt` après connexion au projet.
3. Configurer les secrets de la fonction :
   - `IP_HASH_SALT` : chaîne aléatoire secrète longue, générée par exemple avec `openssl rand -hex 32`.
   - `ALLOWED_ORIGINS` : origines exactes du site séparées par des virgules, sans slash final (exemple : `https://www.goklimb.com,https://goklimb.com`). Ajouter l’origine Webflow de préproduction si nécessaire. Vérifier les domaines réels avant publication.
   - `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont les variables serveur utilisées par le code, normalement fournies par Supabase. Ne jamais copier la clé de service dans Webflow ou dans le HTML.
4. Remplacer `data-score-api=""` dans le HTML optimisé par `data-score-api="https://VOTRE_PROJET.supabase.co/functions/v1/klimb-scores"`. Faire le même changement dans le source lisible pour les futures modifications.
5. Coller le HTML dans le Code Embed de la page 404 Webflow, avec un conteneur de largeur 100 %, sans hauteur fixe. Publier sur le domaine autorisé. Tester sur le site publié, pas seulement dans le Designer. Un aperçu en fichier local n’est pas autorisé par la configuration CORS.

Documentation officielle : [déploiement](https://supabase.com/docs/guides/functions/deploy), [secrets](https://supabase.com/docs/guides/functions/secrets).

## Fonctionnement

Le serveur ouvre une session au début de la partie. À la défaite, le score calculé par le jeu est figé et vérifié. S’il entre dans les cinq meilleurs, le joueur peut saisir un pseudo de 2 à 16 caractères et enregistrer ce score. Il ne peut pas saisir lui-même une valeur de score dans le formulaire. Au moment de valider, le serveur revérifie le classement sous verrou : si une autre personne a pris la place, un message invite à rejouer. À égalité, le score déjà enregistré garde sa place.

Le top 5 correspond aux cinq meilleurs scores enregistrés, pas à cinq identités vérifiées : sans compte, une personne peut y apparaître plusieurs fois. Les pseudos sont publics, ne doivent pas contenir de coordonnées personnelles et sont affichés comme texte, jamais comme HTML. Le record individuel reste enregistré uniquement sur l’appareil.

## Limites et exploitation

Les tables ne sont pas accessibles directement aux visiteurs ; la clé de service reste côté serveur. Les sessions expirent, les scores finalisés sont immuables, les soumissions sont idempotentes et les départs limités par empreinte d’IP. Les sessions non soumises de plus de 24 h sont purgées lors d’un nouveau départ. Les scores enregistrés sont conservés ; prévoir une politique de rétention et une modération des pseudos adaptée au site.

Les limites de temps et de score sont des contrôles de cohérence, pas un système anti-triche complet : le jeu calcule encore le score dans le navigateur. CORS ne constitue pas une authentification. Pour un concours avec récompenses, prévoir la validation serveur d’un replay, une protection anti-bot et des limites supplémentaires au niveau de la passerelle. L’IP provient de `x-forwarded-for` : vérifier que la passerelle le fournit de façon fiable. Les réseaux partagés peuvent atteindre la limite commune (15 départs/minute, 1000/jour).

## Recette avant mise en ligne

- Vérifier GET de la fonction depuis le domaine autorisé : `{"top":[]}` sur une base vide.
- Faire une partie, enregistrer un pseudo ; vérifier le résultat depuis un deuxième navigateur/appareil.
- Remplir cinq places, vérifier qu’un score inférieur ou égal au cinquième n’ouvre pas le formulaire.
- Vérifier deux soumissions concurrentes : seules celles encore qualifiées sont acceptées.
- Simuler une coupure réseau : le jeu continue, le classement signale son indisponibilité.
- Vérifier sur appareils iOS et Android réels le saut maintenu, le relâchement, la rotation et le clavier du pseudo.

Validation locale effectuée : Chrome aux largeurs 320, 360, 390, 430, 768, 844 et 1200 px ; absence de débordement horizontal ; cibles tactiles ; démarrage, saut clavier, pause, reprise et collision. Parcours top 5 testé avec un serveur simulé : qualification, enregistrement, dépassement entre vérification et soumission, score non qualifié. Syntaxe TypeScript vérifiée. Le SQL et le service Supabase devront être testés sur le projet déployé ; aucun test de production ni test sur téléphone réel n’a encore été réalisé.
