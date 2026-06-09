import type { User } from 'src/types';

const USER_KEY = 'user';

export const authStorage = {

    setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),

    getUser: (): User | null => {
        const data = localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    clear: () => {
        localStorage.removeItem(USER_KEY);
    }
};
