import React, { useState } from "react";
import { Box, Button, TextField, Tooltip } from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import CloseIcon from "@mui/icons-material/Close";

const Card_new = ({ openCard, setOpenCard, addCard }) => {
    const [cardName, setCardName] = useState("");

    const handleAddCard = () => {
        addCard(cardName);
        setCardName("");
        setOpenCard(false);
    };

    const handleKeyDown = async (event) => {
        if (event.key === "Enter") {
          await handleAddCard(); // Gọi hàm addColumn khi nhấn Enter
        }
      };

    return (
        <Box
            sx={{
                height: (theme) => theme.trello.columnHeaderHeight,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            {!openCard ? (
                <Box
                    sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Button
                        startIcon={<AddCardIcon />}
                        sx={{ color: "primary.dark" }}
                        onClick={() => setOpenCard(true)}
                    >
                        Add new card
                    </Button>
                    <Tooltip title="Kéo để di chuyển">
                        <DragHandleIcon sx={{ cursor: "pointer" }} />
                    </Tooltip>
                </Box>
            ) : (
                <Box
                    sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <TextField
                        label="Nhập tên thẻ..."
                        type="text"
                        size="small"
                        variant="outlined"
                        autoFocus
                        value={cardName}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setCardName(e.target.value)}
                        sx={{
                            "& label": { color: "teal" },
                            "& input": { color: "black", fontSize: "14px" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: "teal !important",
                                    borderWidth: "0.5px !important",
                                },
                                "&:hover fieldset": { borderColor: "teal" },
                                "&.Mui-focused fieldset": { borderColor: "teal" },
                            },
                        }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            onClick={handleAddCard}
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{
                                boxShadow: "none",
                                border: "none",
                                bgcolor: "teal",
                            }}
                        >
                            Add
                        </Button>
                        <CloseIcon
                            fontSize="small"
                            sx={{
                                color: "teal",
                                cursor: "pointer",
                            }}
                            onClick={() => setOpenCard(false)}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Card_new;