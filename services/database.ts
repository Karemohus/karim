import { Database } from '../types';
import { INITIAL_DATABASE } from '../data/initialData';

const DB_KEY = 'aqarlink_database';

export const loadDatabase = (): Database => {
    try {
        const savedDb = localStorage.getItem(DB_KEY);
        if (savedDb) {
            // A simple migration check: if a new top-level key from initial data is missing, add it.
            const parsedDb = JSON.parse(savedDb);
            let needsUpdate = false;
            for (const key in INITIAL_DATABASE) {
                if (!parsedDb.hasOwnProperty(key)) {
                    parsedDb[key] = INITIAL_DATABASE[key as keyof Database];
                    needsUpdate = true;
                }
            }
            if(needsUpdate) {
                saveDatabase(parsedDb);
            }
            return parsedDb as Database;
        }
    } catch (error) {
        console.error("Failed to load database from localStorage, resetting.", error);
        localStorage.removeItem(DB_KEY);
    }
    // If nothing is saved or parsing fails, return the initial database
    return INITIAL_DATABASE;
};

export const saveDatabase = (db: Database) => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Failed to save database to localStorage.", error);
    }
};
