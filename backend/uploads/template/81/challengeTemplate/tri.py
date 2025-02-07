def tri_par_selection(tab):
    n = len(tab)
    
    # Parcours tous les éléments du tableau
    for i in range(n):
        # Trouver le plus petit élément dans la partie non triée
        min_index = i
        for j in range(i+1, n):
            if tab[j] < tab[min_index]:
                min_index = j
        
        # Échange l'élément actuel avec le plus petit trouvé
        tab[i], tab[min_index] = tab[min_index], tab[i]
    
    return tab

# Exemple d'utilisation
tableau = [64, 25, 12, 22, 11]
print("Avant le tri:", tableau)

tableau_trie = tri_par_selection(tableau)

print("Après le tri:", tableau_trie)