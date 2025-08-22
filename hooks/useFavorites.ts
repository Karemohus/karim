
import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

export const useFavorites = (): [string[], (id: string) => void] => {
    const { currentUser, updateUser, isUser } = useAuth();

    // If a user is logged in, use their favorite list. Otherwise, return an empty array and a no-op function.
    const favoriteIds = isUser && currentUser ? currentUser.favoritePropertyIds : [];

    const toggleFavorite = useCallback((id: string) => {
        if (!isUser || !currentUser) {
            // Optionally, prompt the user to log in to save favorites.
            alert("الرجاء تسجيل الدخول لحفظ العقارات في المفضلة.");
            return;
        }

        const newFavoriteIds = favoriteIds.includes(id)
            ? favoriteIds.filter(favId => favId !== id)
            : [...favoriteIds, id];
        
        updateUser({ ...currentUser, favoritePropertyIds: newFavoriteIds });

    }, [currentUser, isUser, favoriteIds, updateUser]);

    return [favoriteIds, toggleFavorite];
};
