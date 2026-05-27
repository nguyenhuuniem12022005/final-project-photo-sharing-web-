import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import fetchModel, { API_BASE } from "../../lib/fetchModelData";

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
 * UserComments - Extra Credit.
 * Hiển thị tất cả bình luận của một user.
 * Mỗi bình luận có thumbnail ảnh + nội dung.
 * Clicking chuyển đến view chi tiết ảnh.
 */
function UserComments({ advancedFeaturesEnabled }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [commentItems, setCommentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [userData, allUsers] = await Promise.all([
          fetchModel(`/user/${userId}`),
          fetchModel("/user/list"),
        ]);

        const allPhotosArrays = await Promise.all(
          allUsers.map((u) => fetchModel(`/photosOfUser/${u._id}`))
        );

        if (!isMounted) return;

        setUser(userData);

        const items = [];
        allPhotosArrays.forEach((photos) => {
          photos.forEach((photo) => {
            (photo.comments || []).forEach((comment) => {
              if (
                comment.user &&
                comment.user._id.toString() === userId.toString()
              ) {
                items.push({ photo, comment });
              }
            });
          });
        });

        setCommentItems(items);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [userId]);

  const handleNavigateToPhoto = (photo) => {
    if (advancedFeaturesEnabled) {
      navigate(`/photos/${photo.user_id}/${photo._id}`);
    } else {
      navigate(`/photos/${photo.user_id}`);
    }
  };

  if (loading) return <CircularProgress size={24} />;
  if (error) return <Alert severity="error">Unable to load comments: {error}</Alert>;
  if (!user) return <Alert severity="warning">User not found.</Alert>;

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Typography variant="h5">
        Comments by {user.first_name} {user.last_name}
      </Typography>
      <Divider />

      {commentItems.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          This user has not made any comments yet.
        </Typography>
      )}

      {commentItems.map(({ photo, comment }) => (
        <Card key={comment._id} variant="outlined">
          <CardActionArea
            onClick={() => handleNavigateToPhoto(photo)}
            sx={{ display: "flex", alignItems: "flex-start", p: 1, gap: 2 }}
          >
            <Box
              component="img"
              src={imageMap[photo.file_name] || `${API_BASE}/images/${photo.file_name}`}
              alt={photo.file_name}
              sx={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
            <CardContent sx={{ p: 0, flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatDateTime(comment.date_time)}
              </Typography>
              <Typography variant="body1">{comment.comment}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}

export default UserComments;
