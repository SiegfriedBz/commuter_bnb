import React from 'react';

export interface IUser {
    userId?: number,
    email?: string,
    role?: string,
}

export interface IUserContext extends IUser {
    setUser: React.Dispatch<React.SetStateAction<IUser>>,
    setTokenInStorage: React.Dispatch<React.SetStateAction<string>>
}