import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProjectDocumentation, updateProjectDocumentation } from "../api";
import Button from "../components/Button";
import ReactMarkdown from "react-markdown";
import './style/projectDocumentation.css';
import { FaEdit, FaSave, FaTimes, FaFileImport, FaFileExport } from "react-icons/fa";


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

  
    <div className="card--header" style={{ position: "relative", textAlign: "center" }}>
    {/* Naslov projekta */}
    <h1>Project Documentation</h1>

    {/* Desni gumbi: DOC + Edit */}
    <div style={{
      position: "absolute",
      top: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      paddingRight: 15
    }}>
       {!editing && (
          <div className="doc-toolbar">
            <FaEdit title="Edit" onClick={() => setEditing(true)} className="doc-icon edit" />
            <label title="Import" style={{ cursor: "pointer" }}>
              <FaFileImport className="doc-icon import" />
              <input type="file" accept=".txt" onChange={handleImport} style={{ display: "none" }} />
            </label>
            <FaFileExport title="Export" onClick={handleExport} className="doc-icon export" />
          </div>
        )}
    </div>
  </div>
  
      {editing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          style={{ width: "100%", fontSize: "1.6rem" }}
          className="edit-markdown textarea"
        />
      ) : (
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}

      <div className="modal-buttons">
        {editing && (
          <div style={{ margin: "0.5rem", display: "flex", gap: "0" }}>
            <Button onClick={handleCancel} variant="accent btn btn--half">Cancel</Button>
            <Button onClick={handleSave} className="btn btn--primery btn--half">Save</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDocumentation;
