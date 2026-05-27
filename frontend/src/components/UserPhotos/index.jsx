import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel, { API_BASE, postJson } from "../../lib/fetchModelData";

import kenobi1 from "../../images/kenobi1.jpg";
import kenobi2 from "../../images/kenobi2.jpg";
import kenobi3 from "../../images/kenobi3.jpg";
import kenobi4 from "../../images/kenobi4.jpg";
import ludgate1 from "../../images/ludgate1.jpg";
import malcolm1 from "../../images/malcolm1.jpg";
import malcolm2 from "../../images/malcolm2.jpg";
import ouster from "../../images/ouster.jpg";
import ripley1 from "../../images/ripley1.jpg";
import ripley2 from "../../images/ripley2.jpg";
import took1 from "../../images/took1.jpg";
import took2 from "../../images/took2.jpg";

const imageMap = {
  "kenobi1.jpg": kenobi1,
  "kenobi2.jpg": kenobi2,
  "kenobi3.jpg": kenobi3,
  "kenobi4.jpg": kenobi4,
  "ludgate1.jpg": ludgate1,
  "malcolm1.jpg": malcolm1,
  "malcolm2.jpg": malcolm2,
  "ouster.jpg": ouster,
  "ripley1.jpg": ripley1,
  "ripley2.jpg": ripley2,
  "took1.jpg": took1,
  "took2.jpg": took2,
};

function formatDateTime(dateString) {
  if (!dateString) return "Unknown time";
  const normalized = dateString.replace(" ", "T");
  const dateValue = new Date(normalized);
  if (Number.isNaN(dateValue.getTime())) return dateString;
  return dateValue.toLocaleString();
}

/**
 * UserPhotos - Hiển thị ảnh của một người dùng kèm bình luận.
 * Gọi GET /user/:id và GET /photosOfUser/:id từ backend.
 * Hỗ trợ chế độ stepper (advancedFeaturesEnabled).
 */
function UserPhotos({ advancedFeaturesEnabled, currentUser, photoVersion = 0, onCommentAdded }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [userData, photoData] = await Promise.all([
          fetchModel(`/user/${userId}`),
          fetchModel(`/photosOfUser/${userId}`),
        ]);

        if (isMounted) {
          setUser(userData);
          setPhotos(photoData);

          if (advancedFeaturesEnabled && photoData.length > 0) {
            const hasMatchingPhotoId = photoData.some((p) => p._id === photoId);
            if (!photoId || !hasMatchingPhotoId) {
              navigate(`/photos/${userId}/${photoData[0]._id}`, { replace: true });
            }
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [userId, photoId, advancedFeaturesEnabled, navigate, photoVersion]);

  const submitComment = async (pId) => {
    try {
      setCommentError("");
      const text = (commentDrafts[pId] || "").trim();
      await postJson(`/commentsOfPhoto/${pId}`, { comment: text });
      setCommentDrafts((s) => ({ ...s, [pId]: "" }));
      const photoData = await fetchModel(`/photosOfUser/${userId}`);
      setPhotos(photoData);
      if (onCommentAdded) onCommentAdded();
    } catch (e) {
      setCommentError(e.message || "Unable to add comment");
    }
  };

  const renderPhotoCard = (photo) => (
    <Card key={photo._id} variant="outlined">
      <img
        className="user-photo-image"
        src={imageMap[photo.file_name] || `${API_BASE}/images/${photo.file_name}`}
        alt={`Uploaded by ${user.first_name} ${user.last_name}`}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Posted: {formatDateTime(photo.date_time)}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="subtitle1">Comments</Typography>
        {photo.comments && photo.comments.length > 0 ? (
          <List disablePadding>
            {photo.comments.map((comment) => (
              <ListItem key={comment._id} alignItems="flex-start" disableGutters>
                <ListItemText
                  primary={
                    <>
                      {comment.user ? (
                        <Link to={`/users/${comment.user._id}`}>
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>
                      ) : (
                        <span>Unknown user</span>
                      )}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {formatDateTime(comment.date_time)}
                      </Typography>
                    </>
                  }
                  secondary={comment.comment}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        )}

        {commentError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {commentError}
          </Alert>
        )}

        {currentUser?._id && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a comment..."
              value={commentDrafts[photo._id] || ""}
              onChange={(e) =>
                setCommentDrafts((s) => ({ ...s, [photo._id]: e.target.value }))
              }
            />
            <Button
              variant="contained"
              onClick={() => submitComment(photo._id)}
            >
              Add
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return <CircularProgress size={24} />;
  if (error) return <Alert severity="error">Unable to load photos: {error}</Alert>;
  if (!user) return <Alert severity="warning">User not found.</Alert>;

  const currentPhotoIndex = photos.findIndex((p) => p._id === photoId);
  const activePhotoIndex = currentPhotoIndex >= 0 ? currentPhotoIndex : 0;
  const activePhoto = photos[activePhotoIndex];

  const goToPhotoByIndex = (index) => {
    const photo = photos[index];
    if (!photo) return;
    navigate(`/photos/${userId}/${photo._id}`);
  };

  return (
    <Stack spacing={2} className="user-photos">
      <Typography variant="h5">
        Photos of {user.first_name} {user.last_name}
      </Typography>

      {photos.length === 0 && (
        <Typography variant="body1">This user has no photos yet.</Typography>
      )}

      {!advancedFeaturesEnabled && photos.map((photo) => renderPhotoCard(photo))}

      {advancedFeaturesEnabled && photos.length > 0 && (
        <>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              disabled={activePhotoIndex <= 0}
              onClick={() => goToPhotoByIndex(activePhotoIndex - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              disabled={activePhotoIndex >= photos.length - 1}
              onClick={() => goToPhotoByIndex(activePhotoIndex + 1)}
            >
              Next
            </Button>
            <Typography variant="body2" className="user-photo-stepper-info">
              Photo {activePhotoIndex + 1} of {photos.length}
            </Typography>
          </Stack>
          {activePhoto && renderPhotoCard(activePhoto)}
        </>
      )}
    </Stack>
  );
}

export default UserPhotos;
