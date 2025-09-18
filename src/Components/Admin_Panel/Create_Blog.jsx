import React, { useState } from "react";
import { Box, TextField, Button, Typography, InputLabel } from "@mui/material";

const Create_Blog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Blog Submitted!");
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setImage(null);
    setPreview(null);
  };

  return (
    <section
      style={{
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#fff",
        width: "950px",
        margin: "5px auto",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2} color="primary">
        Create Blog
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Title" variant="outlined" margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <Box sx={{ mt: 2 }}>
          <InputLabel sx={{ fontWeight: "bold", mb: 1 }}>Description</InputLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{
              width: "97%",
              padding: "16.5px 14px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <InputLabel sx={{ fontWeight: "bold", mb: 1 }}>Upload Image</InputLabel>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </Box>

        {preview && <img src={preview} alt="Preview" style={{ width: "100%", height: "400px", objectFit: "contain", marginTop: "10px" }} />}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button type="submit" variant="contained" color="primary">Submit</Button>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
        </Box>
      </form>
    </section>
  );
};

export default Create_Blog;
