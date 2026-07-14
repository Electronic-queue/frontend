export const inputStyles = {
    "& .MuiOutlinedInput-root": {
        minHeight: 56,
        borderRadius: "14px",
        backgroundColor: "#ffffff",
    },
};

export const primaryButtonStyles = {
    minHeight: 52,
    borderRadius: "14px",
    textTransform: "none",
    fontSize: 15,
    fontWeight: 700,
    backgroundColor: "#356fbd",
    boxShadow: "0 8px 18px rgba(53, 111, 189, 0.24)",

    "&:hover": {
        backgroundColor: "#2d62a9",
        boxShadow: "0 10px 22px rgba(53, 111, 189, 0.3)",
    },

    "&.Mui-disabled": {
        backgroundColor: "#d7e1ee",
        color: "#8b9bad",
    },
};
