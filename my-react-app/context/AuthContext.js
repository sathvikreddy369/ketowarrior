import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signup = async (username, email, password) => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", { username, email, password });
      alert("Signup successful. You can now login.");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      setUser(res.data.user);
      alert("Login successful!");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
