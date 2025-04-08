import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProjectDocumentation, updateProjectDocumentation } from "../api";
import Button from "../components/Button";

const ProjectDocumentation = () => {
  const { projectId } = useParams();
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      const doc = await getProjectDocumentation(projectId);
      setContent(doc || "");
      setOriginalContent(doc || "");
    };
    fetchDoc();
  }, [projectId]);

  const handleSave = async () => {
    await updateProjectDocumentation(projectId, content);
    setOriginalContent(content);
    setEditing(false);
  };

  const handleCancel = () => {
    setContent(originalContent);
    setEditing(false);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      await updateProjectDocumentation(projectId, content);
      setContent(content);
      setOriginalContent(content);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `project_${projectId}_documentation.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="center--box">
      <h1>Project Documentation</h1>

      {editing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          style={{ width: "100%", fontSize: "1.6rem" }}
        />
      ) : (
        <div className="doc-display">
          <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
        </div>
      )}

      <div className="modal-buttons">
        {editing ? (
          <>
            <Button onClick={handleCancel} variant="secondary">Cancel</Button>
            <Button onClick={handleSave} className="btn btn--primery">Save</Button>
          </>
        ) : (
          <>
            <Button onClick={() => setEditing(true)}>Edit</Button>
            <Button onClick={handleExport} variant="secondary">Export</Button>
            <label className="btn btn--outline" style={{ cursor: "pointer" }}>
              Import
              <input type="file" accept=".txt" onChange={handleImport} style={{ display: "none" }} />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDocumentation;
