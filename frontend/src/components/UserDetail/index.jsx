import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * UserDetail - Hiển thị thông tin chi tiết của một người dùng.
 * Gọi GET /user/:id từ backend.
 */
function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");
        const userData = await fetchModel(`/user/${userId}`);
        if (isMounted) setUser(userData);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();
    return () => { isMounted = false; };
  }, [userId]);

  if (loading) return <CircularProgress size={24} />;
  if (error) return <Alert severity="error">Unable to load user: {error}</Alert>;
  if (!user) return <Alert severity="warning">User not found.</Alert>;

  return (
    <Stack spacing={2} className="user-detail">
      <Typography variant="h5">
        {user.first_name} {user.last_name}
      </Typography>
      <Divider />
      <Typography variant="body1">
        <strong>Location:</strong> {user.location}
      </Typography>
      <Typography variant="body1">
        <strong>Occupation:</strong> {user.occupation}
      </Typography>
      <Typography variant="body1">
        <strong>Description:</strong> {user.description}
      </Typography>
      <Button
        component={Link}
        to={`/photos/${user._id}`}
        variant="contained"
        className="user-detail-photos-link"
      >
        View Photos
      </Button>
    </Stack>
  );
}

export default UserDetail;
