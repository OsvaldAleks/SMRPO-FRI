import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserStatus } from "../api";

function UserStatusHandler() {
  const { user } = useAuth(); // Access user from AuthContext

  useEffect(() => {
    if (user) {
      updateUserStatus(user.uid, "online"); // Set user online

      const handleUnload = () => {
        updateUserStatus(user.uid, "offline"); // Set user offline when they leave
      };

      window.addEventListener("beforeunload", handleUnload);

      return () => {
        updateUserStatus(user.uid, "offline"); // Also update when component unmounts
        window.removeEventListener("beforeunload", handleUnload);
      };
    }
  }, [user]);

  return null;
}

export default UserStatusHandler;
