import { useAuth } from "../context/AuthContext";

const UserStoryDetails = () => {
  const { user, loading } = useAuth();

  return (
    <div className="center--box">
        <h1>TEST</h1>
    </div>
  );
};

export default UserStoryDetails;
