const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Créer le challenge "Calculatrice"
  const challenge = await prisma.challenge.create({
    data: {
      title: 'Créer une Calculatrice en Python',
      description: 'Implémentez une calculatrice capable de réaliser les 4 opérations de base : addition, soustraction, multiplication, division.',
      difficulty: 'Easy',
      estimatedTime: 30,
      authorId: 1,
      stages: {
        create: [
          {
            title: 'Étape 1 : Implémenter l\'Addition',
            description: `
### Objectif :
Ajoutez une fonction \`add(a, b)\` dans \`calculator.py\` qui retourne la somme de deux nombres.

### Détails :
1. Ouvrez le fichier \`calculator.py\`.
2. Ajoutez une fonction appelée \`add\` qui prend deux arguments \`a\` et \`b\`.
3. La fonction doit retourner le résultat de l'addition de \`a\` et \`b\`.

### Exemple attendu :
Si l'on exécute le programme comme suit :
\`\`\`
./your_program.sh add 2 3
\`\`\`
Le résultat attendu est :
\`\`\`
5
\`\`\`

### Validation :
Le système exécutera votre programme avec différents paramètres \`a\` et \`b\` pour vérifier si le résultat correspond à \`a + b\`. Vous devez passer toutes les vérifications pour valider cette étape.
            `,
            order: 0,
          },
          {
            title: 'Étape 2 : Implémenter la Soustraction',
            description: `
### Objectif :
Ajoutez une fonction \`subtract(a, b)\` dans \`calculator.py\` qui retourne la différence entre deux nombres.

### Détails :
1. Ouvrez le fichier \`calculator.py\`.
2. Ajoutez une fonction appelée \`subtract\` qui prend deux arguments \`a\` et \`b\`.
3. La fonction doit retourner le résultat de la soustraction de \`a\` et \`b\`.

### Exemple attendu :
Si l'on exécute le programme comme suit :
\`\`\`
./your_program.sh subtract 5 2
\`\`\`
Le résultat attendu est :
\`\`\`
3
\`\`\`

### Validation :
Le système exécutera votre programme avec différents paramètres \`a\` et \`b\` pour vérifier si le résultat correspond à \`a - b\`. Vous devez passer toutes les vérifications pour valider cette étape.
            `,
            order: 1,
          },
          {
            title: 'Étape 3 : Implémenter la Multiplication',
            description: `
### Objectif :
Ajoutez une fonction \`multiply(a, b)\` dans \`calculator.py\` qui retourne le produit de deux nombres.

### Détails :
1. Ouvrez le fichier \`calculator.py\`.
2. Ajoutez une fonction appelée \`multiply\` qui prend deux arguments \`a\` et \`b\`.
3. La fonction doit retourner le résultat de la multiplication de \`a\` et \`b\`.

### Exemple attendu :
Si l'on exécute le programme comme suit :
\`\`\`
./your_program.sh multiply 4 3
\`\`\`
Le résultat attendu est :
\`\`\`
12
\`\`\`

### Validation :
Le système exécutera votre programme avec différents paramètres \`a\` et \`b\` pour vérifier si le résultat correspond à \`a * b\`. Vous devez passer toutes les vérifications pour valider cette étape.
            `,
            order: 2,
          },
          {
            title: 'Étape 4 : Implémenter la Division',
            description: `
### Objectif :
Ajoutez une fonction \`divide(a, b)\` dans \`calculator.py\` qui retourne le quotient de deux nombres.

### Détails :
1. Ouvrez le fichier \`calculator.py\`.
2. Ajoutez une fonction appelée \`divide\` qui prend deux arguments \`a\` et \`b\`.
3. La fonction doit retourner le résultat de la division de \`a\` par \`b\`.
4. Gérez le cas où \`b = 0\` en retournant un message d'erreur comme \`"Erreur : Division par zéro."\`.

### Exemple attendu :
Si l'on exécute le programme comme suit :
\`\`\`
./your_program.sh divide 6 3
\`\`\`
Le résultat attendu est :
\`\`\`
2.0
\`\`\`

Si \`b = 0\` :
\`\`\`
./your_program.sh divide 6 0
\`\`\`
Le résultat attendu est :
\`\`\`
Erreur : Division par zéro.
\`\`\`

### Validation :
Le système exécutera votre programme avec différents paramètres \`a\` et \`b\` pour vérifier si le résultat correspond à \`a / b\` ou si l'erreur est correctement gérée. Vous devez passer toutes les vérifications pour valider cette étape.
            `,
            order: 3,
          },
        ],
      },
    },
  });

  console.log('Challenge créé avec succès :', challenge);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
