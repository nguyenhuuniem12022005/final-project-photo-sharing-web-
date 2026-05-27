import React, { useEffect, useState } from "react";
import {
  AppBar,
  Button,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Typography,
} from "@mui/material";
import { matchPath, useLocation, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function TopBar(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [contextLabel, setContextLabel] = useState("User List");
  const {
    advancedFeaturesEnabled,
    onAdvancedFeaturesChange,
    currentUser,
    onLogout,
    onUploadPhoto,
  } = props;

  useEffect(() => {
    let isMounted = true;

    const setNameContext = async (prefix, userId) => {
      try {
        if (!currentUser?._id) {
          if (isMounted) setContextLabel("Please Login");
          return;
        }
        const user = await fetchModel(`/user/${userId}`);
        if (!isMounted || !user) return;
        const fullName = `${user.first_name} ${user.last_name}`;
        setContextLabel(prefix ? `${prefix} ${fullName}` : fullName);
      } catch {
        if (isMounted) setContextLabel(prefix || "Photo Sharing App");
      }
    };

    const usersMatch = matchPath("/users/:userId", location.pathname);
    const photosWithPhotoMatch = matchPath("/photos/:userId/:photoId", location.pathname);
    const photosMatch = photosWithPhotoMatch || matchPath("/photos/:userId", location.pathname);
    const commentsMatch = matchPath("/comments/:userId", location.pathname);

    if (usersMatch?.params?.userId) {
      setNameContext("", usersMatch.params.userId);
    } else if (photosMatch?.params?.userId) {
      setNameContext("Photos of", photosMatch.params.userId);
    } else if (commentsMatch?.params?.userId) {
      setNameContext("Comments by", commentsMatch.params.userId);
    } else if (location.pathname === "/users") {
      setContextLabel("User List");
    } else if (location.pathname === "/login") {
      setContextLabel("Please Login");
    } else {
      setContextLabel("Photo Sharing App");
    }

    return () => {
      isMounted = false;
    };
  }, [location.pathname, currentUser?._id]);

  const handleAddPhoto = () => {
    if (!onUploadPhoto) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await onUploadPhoto(file);
      if (currentUser?._id) {
        navigate(`/photos/${currentUser._id}`);
      }
    };
    input.click();
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <div className="topbar-left">
          <Typography variant="h6" color="inherit" noWrap>
            Nguyen Huu Niem
          </Typography>
          <Typography variant="h6" color="inherit" noWrap sx={{ ml: 24 }}>
            {contextLabel}
          </Typography>
        </div>
        <div style={{ flex: 1 }} />
        {currentUser?._id ? (
          <>
            <Typography variant="body1" color="inherit" noWrap sx={{ mr: 2 }}>
              Hi {currentUser.first_name}
            </Typography>
            <Button color="inherit" onClick={handleAddPhoto} sx={{ mr: 1 }}>
              Add Photo
            </Button>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Typography variant="body1" color="inherit" noWrap sx={{ mr: 2 }}>
            Please Login
          </Typography>
        )}
        <FormControlLabel
          className="topbar-toggle"
          control={
            <Checkbox
              checked={advancedFeaturesEnabled}
              onChange={(e) => onAdvancedFeaturesChange(e.target.checked)}
              color="default"
              size="small"
            />
          }
          label="Enable Advanced Features"
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
