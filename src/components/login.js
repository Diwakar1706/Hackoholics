

// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import Header from './Header';
import { Link, useNavigate } from 'react-router-dom';
import LandingComponent from './landingComponent';

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Toggle between Sign In and Sign Up
  const toggleSignInForm = () => setIsSignInForm(!isSignInForm);

  const handleAuth = async (e) => {
    e.preventDefault();

    // Check for matching passwords on Sign Up
    if (!isSignInForm && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      if (isSignInForm) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Signed In Successfully!");
        navigate("/LandingPage"); 
      } else {
        // Sign Up
        await createUserWithEmailAndPassword(auth, email, password);
        alert("✅ Account Created Successfully!");
        navigate("/LandingPage");
      }
    } catch (error) {
      alert("❌ " + error.message); // Display any Firebase error message
    }
  };

  return (
    <div>
      <Header />
      <div className="absolute w-full h-full z-0">
        <img
          className="w-full h-full object-cover"
          src="https://png.pngtree.com/thumb_back/fw800/back_our/20190619/ourmid/pngtree-environmentally-friendly-album-background-material-image_135491.jpg"
          alt="Background"
        />
      </div>

      <form
        onSubmit={handleAuth}
        className="w-3/12 min-h-[32rem] absolute p-12 bg-indigo-950 bg-opacity-80 my-36 mx-auto right-0 left-0 text-white rounded-lg shadow-xl flex flex-col justify-center"
      >
        <h1 className="font-bold text-3xl py-4 text-center">
          {isSignInForm ? "Sign In" : "Sign Up"}
        </h1>

        {!isSignInForm && (
          <input
            type="text"
            placeholder="Full Name"
            className="p-4 my-2 w-full rounded text-black"
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-4 my-2 w-full rounded text-black"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-4 my-2 w-full rounded text-black"
          required
        />

        {!isSignInForm && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-4 my-2 w-full rounded text-black"
            required
          />
        )}

        <button
          type="submit"
          className="p-4 my-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded"
        >
          {isSignInForm ? "Sign In" : "Sign Up"}
        </button>

        <p
          className="py-2 cursor-pointer hover:underline text-center text-sm"
          onClick={toggleSignInForm}
        >
          {isSignInForm
            ? "New to Eco-Move? Sign Up Now"
            : "Already have an account? Sign In Now"}
        </p>
        <div>
          <Link to="/LandingPage" className="text-center text-sm text-white font-semibold rounded hover:underline">Continue Without Login</Link>
        </div>
        
      </form>
    </div>
  );
};

export default Login;






















// import React, { useState } from 'react'
// import Header from './Header';

// const Login = () => {
//   const[isSignInForm,setIsSignInForm]=useState(true);

//   const toggleSignInForm =() =>{
//     setIsSignInForm(!isSignInForm)


//   }
//   return <div>
//      <Header/> 
//      <div className='absolute'>
//      <img className="min-h-screen overflow-auto"
//        src="https://png.pngtree.com/thumb_back/fw800/back_our/20190619/ourmid/pngtree-environmentally-friendly-album-background-material-image_135491.jpg"
       
//        alt="Logo" />
//      </div>


     
//      {/* <form className='w-3/12 absolute p-12 bg-indigo-950	
//  my-36 mx-auto right-0 left-0 text-white rounded-lg bg-opacity-80  ' >
//         <h1 className='font-bold text-3xl py-4'>{isSignInForm ? "Sign In" : "Sign Up"}
//         </h1>
//         <input type="text" placeholder="Email Address" className=" p-4 my-4 w-full"/>
//         <input type="text" placeholder="Password" className=" p-4 my-4 w-full"/>
//         <button className="p-6 my-4 bg-green w-full rounded-lg">{isSignInForm ? "Sign In" : "Sign Up"}</button>
//         <p className='py-4 ' onClick={toggleSignInForm}>{isSignInForm ? "New to Eco-Move? Sign Up Now" : "Already registered Sign Up Now"}</p>
//       </form> */}



// {/* <form className="w-3/12 absolute p-12 bg-indigo-950 bg-opacity-80 my-36 mx-auto right-0 left-0 text-white rounded-lg">
//   <h1 className="font-bold text-3xl py-4">
//     {isSignInForm ? "Sign In" : "Sign Up"}
//   </h1>

//   {!isSignInForm &&(
//     <input
//       type="text"
//       placeholder="Full Name"
//       className="p-4 my-4 w-full rounded text-black"
//    />
//   )}

//   <input
//     type="text"
//     placeholder="Email Address"
//     className="p-4 my-4 w-full rounded text-black"
//   />
 
//   <input
//     type="password"
//     placeholder="Password"
//     className="p-4 my-4 w-full rounded text-black"
//   />
//   {!isSignInForm && (
//   <input
//     type="password"
//     placeholder="Confirm Password"
//     className="p-4 my-4 w-full rounded text-black"
//   />
// )}


//   <button
//     className="p-4 my-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded"
//   >
//     {isSignInForm ? "Sign In" : "Sign Up"}
//   </button>

//   <p className="py-4 cursor-pointer hover:underline" onClick={toggleSignInForm}>
//     {isSignInForm
//       ? "New to Eco-Move? Sign Up Now"
//       : "Already have an account? Sign In Now"}
//   </p>
// </form> */}

// <form className="w-3/12 min-h-[32rem] absolute p-12 bg-indigo-950 bg-opacity-80 my-36 mx-auto right-0 left-0 text-white rounded-lg shadow-xl flex flex-col justify-center">
//   <h1 className="font-bold text-3xl py-4 text-center">
//     {isSignInForm ? "Sign In" : "Sign Up"}
//   </h1>


//   {!isSignInForm && (
//   <input
//     type="text"
//     placeholder="Full Name"
//     className="p-4 my-2 w-full rounded text-black placeholder:text-gray-400"
//   />
// )}


//   <input
//     type="text"
//     placeholder="Email Address"
//     className="p-4 my-2 w-full rounded text-black"
//   />
//   <input
//     type="password"
//     placeholder="Password"
//     className="p-4 my-2 w-full rounded text-black"
//   />

//   {!isSignInForm && (
//     <input
//       type="password"
//       placeholder="Confirm Password"
//       className="p-4 my-2 w-full rounded text-black"
//     />
//   )}

//   <button
//     className="p-4 my-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded"
//   >
//     {isSignInForm ? "Sign In" : "Sign Up"}
//   </button>

//   <p
//     className="py-2 cursor-pointer hover:underline text-center text-sm"
//     onClick={toggleSignInForm}
//   >
//     {isSignInForm
//       ? "New to Eco-Move? Sign Up Now"
//       : "Already have an account? Sign In Now"}
//   </p>
// </form>


     

//   </div>
  
// }

// export default Login;