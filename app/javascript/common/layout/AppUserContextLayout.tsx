import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppContextProvider, UserContextProvider } from '../contexts'
import Header from "./Header"
import Footer from "./Footer"

const AppUserContextLayout: React.FC<any> = () => {
    return (
        <AppContextProvider>
            <UserContextProvider>
                <Header />
                <main className="container container-fluid mt-2">
                    <Outlet />
                </main>
                {/* <Footer /> */}
            </UserContextProvider>
        </AppContextProvider>
    )
}
export default AppUserContextLayout
