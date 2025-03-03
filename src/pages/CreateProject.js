import React, { useState } from "react";

const CreateProject = () => {
  const [input1, setInput1] = useState("");

  return (
    <div>
      <h1>Create new project</h1>
      <form>
        <div>
          <label>Ime projekta:</label>
          <input 
            type="text" 
            value={input1} 
            onChange={(e) => setInput1(e.target.value)} 
          />
        </div>
        {/*TODO - dodaj seznam obstoječih uporabnikov in toggle za vlogo uporabnika*/}
      </form>
    </div>
  );
};

export default CreateProject;