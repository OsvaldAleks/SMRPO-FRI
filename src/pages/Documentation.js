import { useAuth } from "../context/AuthContext";
import './style/Documentation.css';
import './style/Dashboard.css'
import Button from "../components/Button";
import { FaEdit, FaTrash, FaFileImport, FaFileExport, FaCheck } from "react-icons/fa";

const Documentation = () => {
  const { user } = useAuth();

  return (
    <div className="center--box documentation">
      <h1>User Documentation</h1>


      {user ? (
        <>
          <details>
            <summary style={{fontSize: "1.2em", fontWeight: "bold"}}>Users</summary>

            <details>
            <summary>Add a new user</summary>
            <p><em>You need to be a system administrator to create a new user.</em></p>
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
            <summary>Edit a user's account</summary>
            <p><em>You need to be a system administrator to edit another user's account.</em></p>
            <ol>
              <li>Click on the <strong>Manage Users</strong> tab in the navigation bar.</li>
              <li>Click the <FaEdit/> button next to the user's entry.</li>
              <li>Update any of the following fields:</li>
              <ul>
                <li>Username</li>
                <li>Email</li>
                <li>First Name</li>
                <li>Last Name</li>
                <li>Password</li>
                <li>System Rights</li>
              </ul>
              <li>Click <strong>Update</strong> to apply the changes.</li>
            </ol>
          </details>

          <details>
            <summary>Delete a user's account</summary>
            <p><em>You need to be a system administrator to edit another user's account.</em></p>
            <ol>
              <li>Click on the <strong>Manage Users</strong> tab in the navigation bar.</li>
              <li>Click the <FaTrash className="p--alert"/> button next to the user's entry.</li>
            </ol>
          </details>

          <details>
            <summary>Edit your own account information</summary>
            <ol>
              <li>Click on <strong>Edit Account</strong> in the navigation bar.</li>
              <li>Click <strong>EDIT PERSONAL INFORMATION</strong></li>
              <li>Update any of the following fields:</li>
              <ul>
                <li>Username</li>
                <li>First Name</li>
                <li>Last Name</li>
              </ul>
              <li>Click <strong>Save Changes</strong> to confirm the updates.</li>
              <li>To update your password insert your old password and new password then click <strong>Change password</strong></li>
            </ol>
          </details>

          </details>


          <details>
            <summary style={{fontSize: "1.2em", fontWeight: "bold"}}>Projects</summary>

          <details>
            <summary>Create a new project</summary>
            <p><em>You need to be a system administrator to create a new Project.</em></p>
            <ol>
              <li>Click on the <strong>My Projects</strong> tab in the navigation bar.</li>
              <li>Click on the <strong>+</strong> button.</li>
              <li>Select a name and description for the project and assign roles to selected members.</li>
              <li>Ensure you have assigned at least one of each:</li>
              <ul>
                <li>Product Manager</li>
                <li>SCRUM Master</li>
                <li>Developer</li>
              </ul>
              <li>Click <strong>Create Project</strong>.</li>
            </ol>
          </details>

          <details>
            <summary>Edit an existing project</summary>
            <p><em>You need to be a system administrator or a SCRUM master to edit an existing Project.</em></p>
            <ol>
              <li>Within a Project, click on the <strong><FaEdit/></strong> icon in the top right.</li>
              <li>Select a name and description for the project and assign roles to selected members.</li>
              <li>Ensure you have assigned at least one of each:</li>
              <ul>
                <li>Product Manager</li>
                <li>SCRUM Master</li>
                <li>Developer</li>
              </ul>
              <li>Click <strong>Update Project</strong>.</li>
            </ol>
          </details>

          <details>
            <summary>Edit user documentation</summary>
            <ol>
              <li>Within a Project, click on the <strong>DOC</strong> icon in the top right.</li>
              <li>Click <FaEdit></FaEdit> to edit the documentation.</li>
              <li>Make changes to the markdown</li>
              <li>Click <strong>SAVE</strong> to save your changes.</li>
            </ol>
          </details>

          <details>
            <summary>Export user documentation</summary>
            <ol>
              <li>Within a Project, click on the <strong>DOC</strong> icon in the top right.</li>
              <li>Click <FaFileExport className="doc-icon export" /> to export the documentation.</li>
            </ol>
          </details>

          <details>
            <summary>Import user documentation</summary>
            <ol>
              <li>Within a Project, click on the <strong>DOC</strong> icon in the top right.</li>
              <li>Click <FaFileImport className="doc-icon import" /> to export the documentation.</li>
            </ol>
          </details>

          <details>
            <summary>Post on the project wall</summary>
            <ol>
              <li>Within a Project, click on the <strong>WALL</strong> icon in the top left.</li>
              <li>Write your post in the input field.</li>
              <li>Click <strong>POST</strong> to submit.</li>
            </ol>
          </details>

          <details>
            <summary>Comment on a project wall post</summary>
            <ol>
              <li>Within a Project, click on the <strong>WALL</strong> icon in the top left.</li>
              <li>Click on 💬 on the post you wish to comment.</li>
              <li>Write comment in inout box.</li>
              <li>Click <strong>COMMENT</strong> to submit.</li>
            </ol>
          </details>

          <details>
            <summary>Delete a project wall post</summary>
            <p><em>You need to be a SCRUM master to delete a post.</em></p>
            <ol>
              <li>Within a Project, click on the <strong>WALL</strong> icon in the top left.</li>
              <li>Click on <FaTrash></FaTrash>on the post you wish to delete.</li>
            </ol>
          </details>

       </details>

          <details>
            <summary style={{fontSize: "1.2em", fontWeight: "bold"}}>Sprints</summary>

          <details>
            <summary>Create a Sprint</summary>
            <p><em>You need to be a SCRUM master to create a new Sprint.</em></p>
            <ol>
              <li>Within a project, click on the <strong>+</strong> button under the <strong>Sprints</strong> section.</li>
              <li>Determine the start and end dates of the sprint along with your sprint velocity (determined in Story Points).</li>
              <li>Click <strong>ADD SPRINT</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Edit a Sprint</summary>
            <p><em>You need to be a SCRUM master to edit an existing Sprint.</em></p>
            <p><em>The Sprint must not have started.</em></p>
            <ol>
              <li>Within a Sprint, click on the <strong><FaEdit/></strong> icon in the top right.</li>
              <li>Determine the start and end dates of the sprint along with your sprint velocity (determined in Story Points).</li>
              <li>Click <strong>UPDATE</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Delete a Sprint</summary>
            <p><em>You need to be a SCRUM master to delete an existing Sprint.</em></p>
            <p><em>The Sprint must not have started.</em></p>
            <ol>
              <li>Within a Sprint, click on the <strong className="p--alert"><FaTrash/></strong> icon in the top right.</li>
            </ol>
          </details>
          
          </details>
          <details>
            <summary style={{fontSize: "1.2em", fontWeight: "bold"}}>User Stories</summary>

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
            <summary>Edit a User Story</summary>
            <p><em>You need to be a SCRUM master or a Product Manager to edit an existing User Story.</em></p>
            <p><em>The User Story must not be assigned to a sprint.</em></p>
            <ol>
              <li>Within a User Story, click on the <strong><FaEdit/></strong> icon in the top right.</li>
              <li>Change any of the following in the following details:</li>
              <ul>
                <li>Unique name for your user story</li>
                <li>Description</li>
                <li>List of acceptance criteria</li>
                <li>Priority selection</li>
                <li>Business Value</li>
              </ul>
              <li>Click <strong>UPDATE</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Delete a User Story</summary>
            <p><em>You need to be a SCRUM master or a Product Manager to delete an existing User Story.</em></p>
            <p><em>The User Story must not be assigned to a sprint.</em></p>
            <ol>
              <li>Within a User Story, click on the <strong className="p--alert"><FaTrash/></strong> icon in the top right.</li>
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
            <summary>Add a Story to a Sprint</summary>
            <p><em>You need to be a SCRUM master to add a story to a sprint.</em></p>
            <ol>
              <li>In the Sprint overview, click the <strong>+</strong> button.</li>
              <li>Select the Stories you wish to include by clicking the <strong>checkbox</strong>.</li>
              <li>Click <strong>ADD SELECTED →</strong>.</li>
            </ol>
          </details>
          <details>
            <summary>Accept or reject a User Story</summary>
            <p><em>You need to be a <strong>Product Manager</strong> to accept or reject a User Story.</em></p>
            <p><em>The story must be in a past sprint.</em></p>
            <p><em>The story must have the <strong>Done</strong> status.</em></p>
            <ol>
            <li>Select a story with status <strong>Done</strong></li>
            <li>Click on the <strong>Accept</strong> or <strong>Reject</strong> button.</li>
            <li>Confirm selection by pressing <strong>Confirm Accept</strong> or  <strong>Confirm Reject</strong></li>
            </ol>
          </details>


          </details>
          <details>
            <summary style={{fontSize: "1.2em", fontWeight: "bold"}}>Tasks</summary>

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
          <details>
           <summary>Claim a task</summary>
           <p><em>You need to be a developer in order to claim a Task.</em></p>
           <ol>
           <li>In the Story overview under the Subtasks rubric claim a task, by selecting the <strong>checkmark</strong> in the Claim column.</li>
           </ol>
         </details>
         <details>
           <summary>Unclaim a task</summary>
           <p><em>You need to be a developer in order to claim a Task.</em></p>
           <p><em>The task must be currently claimed by you for you to be able to unclaim it.</em></p>
           <ol>
             <li>In the Story overview under the Subtasks rubric claim a task, by unselecting the <strong>checkmark</strong> in the Claim column.</li>
           </ol>
         </details>
         <details>
           <summary>Mark a task as completed</summary>
           <p><em>You need to be a developer in order to mark a Task as completed.</em></p>
           <p><em>The task must be currently claimed by you for you to be able to mark it as completed.</em></p>
           <ol>
             <li>In the Story overview under the Subtasks rubric mark a task as completed, by selecting the <strong>checkmark</strong> in the Done column.</li>
           </ol>
         </details>
         <details>
           <summary>Log time on a task</summary>
           <p><em>You need to be a developer in order to log your time on a taks.</em></p>
           <p><em>The task must be currently claimed by you for you to be able to log time on it.</em></p>
           <ol>
             <li>In the Story overview click the <strong>RECORD TIME</strong> button.</li>
             <li>Select the task for which you wish to log your time.</li>
             <li>Click the <strong>STOP RECORDING</strong> button to end the logging.</li>
           </ol>
         </details>
         <details>
           <summary>Edit logged time</summary>
           <p><em>You need to have logged time on a task, to edit the logged time.</em></p>
           <ol>
             <li>In the navbar click the <strong>Manage work times</strong> tab.</li>
             <li>Select the task for which you wish to log your time.</li>
             <li>Click the <FaEdit/> button and change the number.</li>
             <li>Click the <FaCheck/> button to save changes.</li>
           </ol>
         </details>


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
      <Button 
          className="btn--block" 
          onClick={() => window.open("https://docs.google.com/document/d/1f9KTCd6mzECuDHWpRKeVL3lC0npLNOJZM9B0BDC7Hls/edit?tab=t.0", "_blank")}
          >
          User role help
      </Button>
    </div>
  );
};

export default Documentation;