import { useAuth } from "../context/AuthContext";
import './style/Documentation.css';

const Documentation = () => {
  const { user } = useAuth();

  return (
    <div className="center--box documentation">
      <h1>User Documentation</h1>
      {user && user.system_rights === "Admin" && (
        <>
          <h2>Admin documentation</h2>
          <details>
            <summary>Add a new user</summary>
            <ol>
              <li>Click on the <strong>Manage Users</strong> tab in the navigation bar.</li>
              <li>Click on the <strong>Add User</strong> button.</li>
              <li>Fill in the user's details:</li>
              <ul>
                <li>A unique username</li>
                <li>Email</li>
                <li>First Name</li>
                <li>Last Name</li>
                <li>Password</li>
                <li>System Rights</li>
              </ul>
              <li>Click <strong>Add User</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Create a new project</summary>
            <ol>
              <li>Click on the <strong>My Projects</strong> tab in the navigation bar.</li>
              <li>Click on the <strong>+</strong> button.</li>
              <li>Select a name for the project and assign roles to selected members.</li>
              <li>Ensure you have assigned at least one of each:</li>
              <ul>
                <li>Product Manager</li>
                <li>SCRUM Master</li>
                <li>Developer</li>
              </ul>
              <li>Click <strong>Create Project</strong>.</li>
            </ol>
          </details>
          <h2>General user documentation</h2>
        </>
      )}
      {user ? (
        <>
          <details>
            <summary>Create a sprint</summary>
            <p><em>You need to be a SCRUM master to create a new Sprint.</em></p>
            <ol>
              <li>Within a project, click on the <strong>+</strong> button under the <strong>Sprints</strong> section.</li>
              <li>Determine the start and end dates of the sprint along with your sprint speed.</li>
              <li>Click <strong>ADD SPRINT</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Create a User Story</summary>
            <p><em>You need to be a SCRUM master or a Product Manager to create a new User Story.</em></p>
            <ol>
              <li>Within a project, click on the <strong>+</strong> button under the <strong>User Stories</strong> section.</li>
              <li>Fill in the following details:</li>
              <ul>
                <li>Unique name for your user story</li>
                <li>Description</li>
                <li>List of acceptance criteria</li>
                <li>Priority selection</li>
                <li>Business Value</li>
              </ul>
              <li>Click <strong>Add User Story</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Determine a Story Point value of a User Story</summary>
            <p><em>You need to be a SCRUM master to set a Story Point value.</em></p>
            <p><em>You cannot edit the Story Point value of a Story in an active Sprint.</em></p>
            <ol>
              <li>Click on the <strong>User Story</strong> you want to set a Story Point value for.</li>
              <li>Enter a Story Point value.</li>
              <li>Click <strong>✔</strong> to save your changes.</li>
            </ol>
          </details>
          <details>
            <summary>Add a story to a Sprint</summary>
            <p><em>You need to be a SCRUM master to add a story to a sprint.</em></p>
            <ol>
              <li>In the Sprint overview, click the <strong>+</strong> button.</li>
              <li>Select the Stories you wish to include by clicking the <strong>checkbox</strong>.</li>
              <li>Click <strong>ADD SELECTED →</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Add a task to a User Story</summary>
            <p><em>You need to be a SCRUM master or a developer to add a task.</em></p>
            <p><em>The story must be in a sprint.</em></p>
            <ol>
              <li>In the Story overview, click the <strong>+ ADD SUBTASK</strong> button.</li>
              <li>Fill in the following details:</li>
              <ul>
                <li>Task name</li>
                <li>Time estimate</li>
                <li><em>Optionally, suggest a Developer.</em></li>
              </ul>
              <li>Click <strong>SAVE SUBTASK</strong>.</li>
            </ol>
          </details>
        </>
      ) : (
        <details>
          <summary>How do I Log in?</summary>
          <div className="image-container">
            <img src="/assets/documentation/login in navbar.png" alt="login in navbar" />
            <img src="/assets/documentation/login form.png" alt="login form" />
          </div>
          <ol>
            <li>Navigate to the <strong>login</strong> page via the navigation bar.</li>
            <li>Input your email and password.</li>
            <li>Click <strong>Login</strong>.</li>
          </ol>
        </details>
      )}
    </div>
  );
};

export default Documentation;