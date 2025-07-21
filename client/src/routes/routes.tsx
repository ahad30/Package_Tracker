import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../components/Layout/HomeLayout/HomeLayout";
import AdminLayout from "../components/Layout/AdminLayout/AdminLayout";
import HomePage from "../pages/Home/HomePage";
import AdminHomePage from "../pages/AdminDashboard/AdminHomePage/AdminHomePage";
const routes = createBrowserRouter([
    // Home routes
    {
        path: '/',
        element: <HomeLayout />,
        errorElement: <div>Home Page Error</div>,
        children: [
            {
                path: '/',
                element: <HomePage />
            }
        ]
    },
    // Admin routes
    {
        path: '/dashboard/admin',
        element: <AdminLayout />,
        errorElement: <div>Admin Page Error</div>,
        children: [
            {
                path: '/dashboard/admin',
                element: <AdminHomePage />,
            }
        ]
    }
])

export default routes;