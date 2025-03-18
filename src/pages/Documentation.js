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
          <p>Click on the <strong>Manage Users</strong> tab in the navigation bar.</p>
          <p>Click on the <strong>Add User</strong> button.</p>
          <p>Fill in the user's details:</p>
          <ul>
            <li>A unique username</li>
            <li>Email</li>
            <li>First Name</li>
            <li>Last Name</li>
            <li>Password</li>
            <li>System Rights</li>
          </ul>
          <p>Click <strong>Add User</strong>.</p> 
        </details>
        <details>
          <summary>Create a new project</summary>
          <p>Click on the <strong>My Projects</strong> tab in the navigation bar.</p>
          <p>Click on the <strong>+</strong> button.</p>
          <p>Select a name for the project and assign roles to selected members.</p>
          <p>After you've selected at least one:</p>
            <ul>
                <li>Product Manager</li>
                <li>SCRUM Master</li>
                <li>Developer</li>
            </ul>
          <p>Click <strong>Create Project</strong>.</p>
        </details>
        <h2>General user documentation</h2>
        </>
      )}
      {user ? (
        <>
        <details>
          <summary>Create a sprint</summary>
          <p>You need to be a <strong>SCRUM master</strong> in order to create a new Sprint.</p>
          <p>Within a project click on the <strong>+</strong> button under the <strong>Sprints</strong> section.</p>
          <p>Determine the start and end dates of the sprint along with your sprint speed and hit <strong>ADD SPRINT</strong>.</p>
        </details>
        <details>
          <summary>Create a User Story</summary>
            <p>You need to be a <strong>SCRUM master</strong> or a <strong>Product Manager</strong> in order to create a new Sprint.</p>
            <p>Within a project click on the <strong>+</strong> button under the <strong>User Stories</strong> section.</p>
            <p>Determine a:</p>
            <ul>
                <li>Unique name for your user story</li>
                <li>enter a description</li>
                <li>a list of acceptance criteria</li>
                <li>select a Priority and</li>
                <li>Business Value</li>
            </ul>
            <p>then hit <strong>Add User Story</strong>.</p>
        </details>
        <details>
            <summary>Determine a Story Point value of a User Story</summary>
            <p>You need to be a <strong>SCRUM master</strong> in order to set a Story Point value.</p>
            <p>You <strong>cannot edit the Story Point value of a Story in an active Sprint</strong>.</p>
            <p>Click on the <strong>User Story</strong> you want to set a Story Point value for.</p>
            <p><strong>Enter a Story Point value</strong> and hit <strong>✔</strong> to save your changes.</p>
        </details>
        <details>
            <summary>Add story to a Sprint</summary>
            <p>You need to be a <strong>SCRUM master</strong> in order to add a story to a sprint.</p>
            <p>In the Sprint overview click the <strong>+</strong> button.</p>
            <p>Select the Stories you wish to include by clicking the <strong>checkbox</strong>.</p>
            <p>Submit your selection by clicking the <strong>ADD SELECTED -></strong> button.</p>
        </details>
        <details>
            <summary>Add a task to a User Story</summary>
            <p>You need to be a <strong>SCRUM master</strong> or a <strong>developer</strong> in order to add a task to a User Story.</p>
            <p>A story needs to be <strong>in a sprint</strong> to have tasks.</p>
            <p>In the Story overview click the <strong>+ ADD SUBTASK</strong> button.</p>
            <p>Input data:</p>
            <ul>
                <li>Task name</li>
                <li>Time estimate</li>
                <li><italic>optionally you can suggest a </italic>Developer.</li>
            </ul>
            <p>Confirm the task creation by clicking the <strong>SAVE SUBTASK</strong> button.</p>
        </details>
        <details>
          <summary>Claim a task</summary>
          <p>You need to be a <strong>developer</strong> in order to claim a Task.</p>
          <p>In the Story overview under the Subtasks rubric claim a task, by selecting the <strong>checkmark</strong> in the Claim column.</p>
        </details>
        <details>
          <summary>Unclaim a task</summary>
          <p>You need to be a <strong>developer</strong> in order to claim a Task.</p>
          <p>The task must be currently <strong>claimed by you</strong> for you to be able to unclaim it.</p>
          <p>In the Story overview under the Subtasks rubric claim a task, by unselecting the <strong>checkmark</strong> in the Claim column.</p>
        </details>
        <details>
          <summary>Mark a task as completed</summary>
          <p>You need to be a <strong>developer</strong> in order to claim a Task.</p>
          <p>The task must be currently <strong>claimed by you</strong> for you to be able to mark it as completed.</p>
          <p>In the Story overview under the Subtasks rubric mark a task as completed, by selecting the <strong>checkmark</strong> in the Done column.</p>
        </details>
        </>
      ) : (
        <details>
          <summary>How do I Log in?</summary>
          <div className="image-container">
            <img src="/assets/documentation/login in navbar.png" alt="login in navbar" />
            <img src="/assets/documentation/login form.png" alt="login form" />
          </div>
          <p>Navigate to the <strong>login</strong> page via the navigation bar.</p>
          <p>Input your email and password and hit <strong>Login</strong>.</p>
        </details>
      )}
    </div>
  );
};

export default Documentation;