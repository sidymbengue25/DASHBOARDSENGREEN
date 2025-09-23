🧾 Cahier des charges — Dashboard Analytique SenGreen (Version GeoInov)

⸻

📌 Contexte

Le projet SenGreen vise à créer une plateforme citoyenne intelligente pour une écologie urbaine inclusive, en intégrant les citoyens dans la gestion des déchets, tout en exploitant les technologies spatiales pour améliorer la prise de décision à l’échelle territoriale.

Ce dashboard est une composante stratégique pour :
	•	Visualiser et comprendre les dynamiques spatiales des déchets.
	•	Aider les collectivités à planifier des politiques environnementales efficaces.
	•	Promouvoir la transparence, la réactivité et l’engagement citoyen.

⸻

🎯 Objectifs du Dashboard
	1.	Offrir une visualisation interactive des données spatiales liées à la gestion des déchets.
	2.	Fournir des analyses de densité, typologie, volume, et fréquence des déchets.
	3.	Suivre en temps réel les interventions, signalements et zones critiques.
	4.	Aider à la planification des ressources pour les collectivités.
	5.	Mettre en valeur l’usage des technologies satellitaires et des SIG (Systèmes d’Information Géographique).

⸻

🔍 Fonctionnalités du Dashboard

1.⁠ ⁠Carte Interactive SIG
	•	Visualisation en temps réel des zones de dépôt de déchets.
	•	Couches multiples : type de déchets, fréquence de collecte, statut des interventions.
	•	Intégration de données satellites (Sentinel, Landsat, etc.) pour détecter les changements environnementaux.

2.⁠ ⁠Analyse de densité
	•	Heatmap des concentrations de déchets par zone géographique.
	•	Corrélation entre densité et typologie d’environnement (résidentiel, industriel, urbain).

3.⁠ ⁠Typologie des déchets
	•	Catégorisation automatique via IA : plastique, organique, électronique, etc.
	•	Statistiques dynamiques par quartier, ville, ou zone de collecte.

4.⁠ ⁠Suivi des interventions
	•	Historique et statut des interventions municipales ou citoyennes.
	•	Temps de réaction moyen, efficacité par arrondissement.

5.⁠ ⁠Statistiques démographiques croisées
	•	Corrélation entre niveau de déchets et densité de population, niveau de revenu, activité économique, etc.

6.⁠ ⁠Alertes intelligentes
	•	Détection automatique de points chauds ou de situations anormales.
	•	Notifications aux autorités et aux utilisateurs.

7.⁠ ⁠Module de prévision
	•	Prédiction de l’évolution des volumes de déchets via machine learning.
	•	Simulation d’impact de certaines politiques publiques (ex : déploiement de bacs).

8.⁠ ⁠Comparaison spatio-temporelle
	•	Évolution de la situation sur une période donnée.
	•	Comparaison entre deux zones ou deux périodes.

⸻

🛰️ Technologies spatiales intégrées
	•	Observation par satellite (Sentinel-2) pour :
	•	Analyser les changements dans l’occupation du sol.
	•	Détecter les zones à forte accumulation illégale.
	•	Données GNSS (positionnement précis des signalements et des bacs).
	•	Cartographie interactive WebGIS via Leaflet, Mapbox ou ArcGIS JS API.

⸻

🧠 Technologies et Stack Technique
	•	Backend : Nodejs avec firestore.
	•	Frontend : Angular avec librairies de visualisation (D3.js, Chart.js).
	•	Cartographie : Leaflet 
	•	Données : OpenStreetMap, données satellites, données citoyennes via l’app SenGreen.
	•	IA / ML : Pour la classification des déchets et la prévision.

⸻

👥 Utilisateurs Cibles
	•	Collectivités territoriales
	•	Services de propreté urbaine
	•	ONG environnementales
	•	Citoyens
	•	Acteurs de la Smart City

⸻

📊 Indicateurs clés affichés
	•	Volume de déchets collectés par jour/semaine/mois
	•	Répartition des types de déchets
	•	Zones critiques (hotspots)
	•	Temps moyen de traitement des signalements
	•	Impact environnemental estimé (CO2, pollution visuelle, etc.)

⸻

🚀 Mise en valeur pour GeoInov
	•	Valorisation du spatial dans les politiques écologiques urbaines.
	•	Exemple concret d’intégration citoyenne, technologique et environnementale.
	•	Appui à la prise de décision territoriale basée sur la donnée géospatiale.
	•	Dashboard comme outil de sensibilisation, d’alerte et de pla