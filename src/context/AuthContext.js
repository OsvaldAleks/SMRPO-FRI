import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getUser } from "../api"

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userData = await getUser(currentUser.uid);

        const userWithPrivileges = {
          ...currentUser,
          system_rights: userData?.system_rights || null,
        };

        setUser(userWithPrivileges);
        sessionStorage.setItem("user", JSON.stringify(userWithPrivileges));
      } else {

        setUser(null);
        sessionStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = await getUser(user.uid)

      const userWithPrivileges = {
        ...user,
        system_rights: userData?.system_rights || null,
      };

      setUser(userWithPrivileges);
      sessionStorage.setItem("user", JSON.stringify(userWithPrivileges));
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth)
      .then(() => {
        setUser(null);
        sessionStorage.removeItem("user");
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);