import { useState } from 'react';

const useLoyalty = () => {
    const [points, setPoints] = useState(0);

    const addPoints = (newPoints: number) => {
        if (newPoints < 0) {
            throw new Error('Le nombre de points doit être positif');
        }
        setPoints(points + newPoints);
    };

    const resetPoints = () => {
        setPoints(0);
    };

    return { points, addPoints, resetPoints };
};

export default useLoyalty;
