import { Snackbar, Alert, Button } from "@mui/material";

const SnackAlert = ({
    open,
    onClose,
    message,
    onUndo,
    autoHideDuration = 7000,
    severity = "success",
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={(event, reason) => {
                if (reason === "clickaway") {
                    return;
                }
                onClose();
            }}
        >
            <Alert
                severity={severity}
                action={
                    onUndo ? (
                        <Button color="inherit" size="small" onClick={onUndo}>
                            UNDO
                        </Button>
                    ) : null
                }
                sx={{ width: "100%" }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default SnackAlert;