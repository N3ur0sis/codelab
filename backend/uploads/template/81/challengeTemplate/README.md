# Challenge Creation App

## Description

Cette application permet aux enseignants de créer des challenges pour leurs étudiants. Les challenges peuvent inclure plusieurs étapes et un dossier (zip ou non) peut être téléchargé pour chaque challenge. Les fichiers téléchargés sont ensuite récupérés côté backend pour être traités ou stockés.

## Fonctionnalités

- Création d'un challenge avec un titre et une description.
- Ajout d'étapes au challenge avec un titre et une description.
- Téléchargement de fichiers ou d'un dossier (zip) pour le challenge.
- Validation de l'utilisateur (seul un enseignant peut ajouter un challenge).

## Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés :

- Node.js
- NPM ou Yarn
- Python (si vous souhaitez tester la création de fichiers ZIP côté client)

## Installation

Clonez ce dépôt et installez les dépendances :

```bash
git clone https://github.com/username/repository.git
cd repository
npm install