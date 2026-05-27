import "./App.css";

import React, { useEffect, useState } from "react";
import { CircularProgress, Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";
import fetchModel, { postFile, postJson } from "./lib/fetchModelData";

function AuthRedirect({ isLoggedIn, children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, location.pathname, navigate]);

  return children;
}

const App = () => {
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [photoVersion, setPhotoVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await fetchModel("/admin/session");
        if (!mounted) return;
        if (s?.loggedIn) setCurrentUser(s.user);
        else setCurrentUser(null);
      } catch {
        if (mounted) setCurrentUser(null);
      } finally {
        if (mounted) setSessionLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Router>
      <AuthRedirect isLoggedIn={!!currentUser?._id}>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar
                advancedFeaturesEnabled={advancedFeaturesEnabled}
                onAdvancedFeaturesChange={setAdvancedFeaturesEnabled}
                currentUser={currentUser}
                onLogout={async () => {
                  await postJson("/admin/logout", {});
                  setCurrentUser(null);
                }}
                onUploadPhoto={async (file) => {
                    await postFile("/photos/new", file);
                    setPhotoVersion((v) => v + 1);
                  }}
              />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                <UserList isLoggedIn={!!currentUser?._id} photoVersion={photoVersion} />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                {sessionLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Routes>
                    <Route
                      path="/login"
                      element={<LoginRegister onLoginSuccess={(u) => setCurrentUser(u)} />}
                    />

                    <Route path="/users/:userId" element={currentUser ? <UserDetail /> : <Navigate to="/login" replace />} />
                    <Route
                      path="/photos/:userId"
                      element={currentUser ? <UserPhotos advancedFeaturesEnabled={advancedFeaturesEnabled} currentUser={currentUser} photoVersion={photoVersion} onCommentAdded={() => setPhotoVersion((v) => v + 1)} /> : <Navigate to="/login" replace />}
                    />
                    <Route
                      path="/photos/:userId/:photoId"
                      element={currentUser ? <UserPhotos advancedFeaturesEnabled={advancedFeaturesEnabled} currentUser={currentUser} photoVersion={photoVersion} onCommentAdded={() => setPhotoVersion((v) => v + 1)} /> : <Navigate to="/login" replace />}
                    />
                    <Route path="/users" element={currentUser ? <UserList isLoggedIn /> : <Navigate to="/login" replace />} />
                    <Route
                      path="/comments/:userId"
                      element={currentUser ? <UserComments advancedFeaturesEnabled={advancedFeaturesEnabled} /> : <Navigate to="/login" replace />}
                    />
                    <Route path="*" element={<Navigate to={currentUser ? "/users" : "/login"} replace />} />
                  </Routes>
                )}
              </Paper>
            </Grid>
          </Grid>
        </div>
      </AuthRedirect>
    </Router>
  );
};

export default App;
