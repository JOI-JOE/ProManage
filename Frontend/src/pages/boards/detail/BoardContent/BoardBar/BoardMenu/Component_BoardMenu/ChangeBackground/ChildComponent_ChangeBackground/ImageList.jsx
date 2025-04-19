import React, { useEffect } from "react";
import { Grid, Button, CircularProgress } from "@mui/material";
import { useImageUnsplash } from "../../../../../../../../../hooks/useBoard";

// Danh sách ảnh mẫu (có thể thay thế bằng ảnh của bạn hoặc từ API Unsplash)


const ImageList = ({ onSelectImage }) => {

  const {
    mutate: fetchUnsplashImages,
    data: unsplashImages,
    isLoading: unsplashingImages,
  } = useImageUnsplash();

  console.log(unsplashImages);
  // useEffect(() => {
  //   fetchUnsplashImages();
  // }, []);

  if (unsplashingImages) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <CircularProgress />
      </Grid>
    );
  }
  return (
    <Grid container spacing={2}>
      {unsplashImages.map((image, index) => (
        <Grid item xs={4} key={index}>
          <Button
            variant="outlined"
            fullWidth
            // src={image.urls.small}
            style={{
              height: "100px",
              backgroundImage: `url(${image.urls.small})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => onSelectImage(image.urls.small)} // Gọi callback
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ImageList;
