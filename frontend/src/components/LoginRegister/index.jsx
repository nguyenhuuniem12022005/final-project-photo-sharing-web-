import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { postJson } from "../../lib/fetchModelData";

function LoginRegister({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [reg, setReg] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const doLogin = async () => {
    try {
      setLoginError("");
      const user = await postJson("/admin/login", {
        login_name: loginName,
        password: loginPassword,
      });
      onLoginSuccess?.(user);
      navigate(`/users/${user._id}`);
    } catch (e) {
      setLoginError(e.message || "Login failed");
    }
  };

  const doRegister = async () => {
    try {
      setRegError("");
      setRegSuccess("");

      if (reg.password !== reg.password2) {
        setRegError("Passwords do not match");
        return;
      }

      await postJson("/user", {
        login_name: reg.login_name,
        password: reg.password,
        first_name: reg.first_name,
        last_name: reg.last_name,
        location: reg.location,
        description: reg.description,
        occupation: reg.occupation,
      });

      setRegSuccess("Registration successful. You can now login.");
      setReg({
        login_name: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
      });
    } catch (e) {
      setRegError(e.message || "Registration failed");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Please Login</Typography>

        {loginError && <Alert severity="error">{loginError}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Login name"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={doLogin} sx={{ minWidth: 120 }}>
            Login
          </Button>
        </Stack>

        <Divider />

        <Typography variant="h6">New user registration</Typography>

        {regError && <Alert severity="error">{regError}</Alert>}
        {regSuccess && <Alert severity="success">{regSuccess}</Alert>}

        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Login name"
              value={reg.login_name}
              onChange={(e) => setReg((s) => ({ ...s, login_name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="First name"
              value={reg.first_name}
              onChange={(e) => setReg((s) => ({ ...s, first_name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Last name"
              value={reg.last_name}
              onChange={(e) => setReg((s) => ({ ...s, last_name: e.target.value }))}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Password"
              type="password"
              value={reg.password}
              onChange={(e) => setReg((s) => ({ ...s, password: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Re-enter password"
              type="password"
              value={reg.password2}
              onChange={(e) => setReg((s) => ({ ...s, password2: e.target.value }))}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Location"
              value={reg.location}
              onChange={(e) => setReg((s) => ({ ...s, location: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Occupation"
              value={reg.occupation}
              onChange={(e) => setReg((s) => ({ ...s, occupation: e.target.value }))}
              fullWidth
            />
          </Stack>

          <TextField
            label="Description"
            value={reg.description}
            onChange={(e) => setReg((s) => ({ ...s, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />

          <Button variant="contained" onClick={doRegister}>
            Register Me
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default LoginRegister;

