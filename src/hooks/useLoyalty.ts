import { useState } from 'react';

const useLoyalty = () => {
    const [points, setPoints] = useState(0); // État pour les points de fidélité

    const addPoints = (newPoints: number) => { // Fonction pour ajouter des points
        setPoints(points + newPoints);
    };

    return { points, addPoints };
};

export default useLoyalty;
