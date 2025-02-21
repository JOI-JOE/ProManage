// FilterDialog.js

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Grid,
  Chip,
  Button,
  Box,
} from "@mui/material";
import React from "react";

const FilterDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Lọc bảng</DialogTitle>
      <DialogContent
        sx={{
          overflowY: "auto",
          //   paddingTop: "20px",
          "&::-webkit-scrollbar": {
            width: "6px", // Chiều rộng thanh cuộn dọc
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888", // Màu thanh cuộn
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555", // Màu khi hover
          },
        }}
      >
        <TextField
          label="Từ khóa"
          variant="outlined"
          fullWidth
          sx={{
            marginTop: "12px",
            marginBottom: "16px",
            "& .MuiInputBase-root": {
              height: "30px", // Đặt chiều cao của ô input
            },
            "& .MuiInputBase-input": {
              fontSize: "14px", // Điều chỉnh kích thước chữ trong ô input
            },
          }}
        />
        <Box>
          <Typography variant="h6">Thành viên</Typography>
          <Grid container direction="column">
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Không có thành viên"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Các thẻ đã chỉ định cho tôi"
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h6">Trạng thái card</Typography>
          <Grid container direction="column">
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Đã đánh dấu hoàn thành"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Không được đánh dấu là đã hoàn thành"
              />
            </Grid>
          </Grid>
          <Typography variant="h6">Ngày hết hạn</Typography>
          <Grid container direction="column">
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Không có ngày hết hạn"
              />
            </Grid>
            <Grid item>
              <FormControlLabel control={<Checkbox />} label="Quá hạn" />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Sẽ hết hạn vào ngày mai"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Sẽ hết hạn vào tuần sau"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Sẽ hết hạn vào tháng sau"
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h6">Nhãn</Typography>
          <Grid container direction="column">
            <Grid item>
              <FormControlLabel control={<Checkbox />} label="Không có nhãn" />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Chip
                    sx={{
                      backgroundColor: "green",
                      color: "white",
                      margin: "4px 0",
                      width: "250px",
                      height: "15px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Chip
                    sx={{
                      backgroundColor: "orange",
                      color: "white",
                      margin: "4px 0",
                      width: "250px",
                      height: "15px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Chip
                    sx={{
                      backgroundColor: "yellow",
                      color: "black",
                      margin: "4px 0",
                      width: "250px",
                      height: "15px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Chip
                    sx={{
                      backgroundColor: "blue",
                      color: "white",
                      margin: "4px 0",
                      width: "250px",
                      height: "15px",
                    }}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h6">Hoạt động</Typography>
          <Grid container direction="column">
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Hoạt động trong tuần qua"
              />
            </Grid>
            <Grid item>
              <FormControlLabel control={<Checkbox />} label="Quá hạn" />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Hoạt động trong 2 tuần qua"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Hoạt động trong 3 tuần qua"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox />}
                label="Không hoạt động trong 4 tuần qua"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onClose}>Áp dụng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
