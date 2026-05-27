import React, { useEffect, useState } from "react";
import {
  Alert,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Link, matchPath, useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * UserList - Danh sách người dùng với bong bóng đếm ảnh (xanh) và bình luận (đỏ).
 * Clicking bong bóng đỏ chuyển sang view danh sách bình luận của user đó.
 */
function UserList({ isLoggedIn = false, photoVersion = 0 }) {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");
        if (!isLoggedIn) {
          if (isMounted) setUsers([]);
          return;
        }
        const usersData = await fetchModel("/user/list");
        if (isMounted) setUsers(usersData);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();
    return () => { isMounted = false; };
  }, [isLoggedIn, photoVersion]);

  const selectedUserId =
    matchPath("/users/:userId", location.pathname)?.params?.userId ||
    matchPath("/photos/:userId/:photoId", location.pathname)?.params?.userId ||
    matchPath("/photos/:userId", location.pathname)?.params?.userId ||
    matchPath("/comments/:userId", location.pathname)?.params?.userId;

  return (
    <div className="user-list">
      <Typography variant="h6" gutterBottom>
        Users
      </Typography>

      {loading && <CircularProgress size={24} />}

      {!loading && error && (
        <Alert severity="error">Unable to load users: {error}</Alert>
      )}

      {!loading && !error && (
        <List component="nav">
          {users.map((user, index) => (
            <React.Fragment key={user._id}>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/users/${user._id}`}
                  selected={selectedUserId === user._id.toString()}
                >
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                  />
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {/* Bong bóng xanh: số lượng ảnh */}
                    <Chip
                      label={user.photo_count ?? 0}
                      size="small"
                      sx={{
                        backgroundColor: "#4caf50",
                        color: "white",
                        fontWeight: "bold",
                        minWidth: 28,
                        height: 22,
                        fontSize: "0.7rem",
                      }}
                    />
                    {/* Bong bóng đỏ: số lượng bình luận - click chuyển đến /comments/:id */}
                    <Chip
                      label={user.comment_count ?? 0}
                      size="small"
                      component={Link}
                      to={`/comments/${user._id}`}
                      clickable
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        backgroundColor: "#f44336",
                        color: "white",
                        fontWeight: "bold",
                        minWidth: 28,
                        height: 22,
                        fontSize: "0.7rem",
                        textDecoration: "none",
                      }}
                    />
                  </Stack>
                </ListItemButton>
              </ListItem>
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </div>
  );
}

export default UserList;
