


// import React, { createElement } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './login'
import Browse from './Browse'
import LandingComponent from './landingComponent';


const Body = () => {
 
   const appRouter=createBrowserRouter([
    {
        path:"/",
        element: <Login/>
    },
    {
        path: "/browse",
        element: <Browse/>
    },
    {
        path: "/LandingPage",
        element: <LandingComponent/>
    }

   ]);
 
 
 
    return (
       <div>
         <RouterProvider router={appRouter}/>
       </div>
    );
};

export default Body;

