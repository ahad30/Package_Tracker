import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../components/Layout/HomeLayout/HomeLayout";
import HomePage from "../pages/Home/HomePage";
const routes = createBrowserRouter([
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
    }
])

export default routes;