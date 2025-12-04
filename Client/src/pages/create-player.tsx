import { Box, Button, Paper, TextField, Typography, Avatar, IconButton } from "@mui/material";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import React, { useState } from "react"

const avatarImages = [
  { id: 1, name: "Akechi", path: "/Images/Persona-5-icons/Akechi.jpg" },
  { id: 2, name: "Ann", path: "/Images/Persona-5-icons/Ann.jpg" },
  { id: 3, name: "Futaba", path: "/Images/Persona-5-icons/Futaba.jpg" },
  { id: 4, name: "Haru", path: "/Images/Persona-5-icons/Haru.jpg" },
  { id: 5, name: "Joker", path: "/Images/Persona-5-icons/Joker.jpg" },
  { id: 6, name: "Kasumi", path: "/Images/Persona-5-icons/Kasumi.jpg" },
  { id: 7, name: "Makoto", path: "/Images/Persona-5-icons/Makoto.jpg" },
  { id: 8, name: "Morgana", path: "/Images/Persona-5-icons/Morgana.jpg" },
  { id: 9, name: "Ryuji", path: "/Images/Persona-5-icons/Ryuji.jpg" },
  { id: 10, name: "Yusuke", path: "/Images/Persona-5-icons/Yusuke.jpg" },
];

export default function CreatePlayer() {
    const [playerName, setPlayerName] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerName(e.target.value);
    }

    const handleSubmit = () => {
        localStorage.setItem("playerName", playerName);
        localStorage.setItem("playerImg", avatarImages[currentIndex].path);
    }

    const nextImg = () => {
        setCurrentIndex((prev) => (prev + 1) % avatarImages.length);
    }

    const prevImg = () => {
        setCurrentIndex((prev) => (prev - 1 + avatarImages.length) % avatarImages.length);
    }

    return (
        <>
            <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                backgroundColor: "#0f1f3d",
                p: 2,
            }}
            >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: "100%",
                    maxWidth: 400,
                    textAlign: "center",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#1e2d4d"
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom sx={{ 
                    fontWeight: "normal", 
                    mb: 3, 
                    color: "white",
                    fontFamily: "Galindo, sans-serif",
                }}>
                    Player Profile
                </Typography>
                
                {/* Avatar Selection */}
                <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 3,
                gap: 2
                }}>
                <IconButton 
                    onClick={prevImg} 
                    sx={{ 
                    color: "primary.main",
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" }
                    }}
                >
                    <ArrowBigLeft fontSize="large" />
                </IconButton>
                
                <Avatar
                    src={avatarImages[currentIndex].path}
                    alt={avatarImages[currentIndex].name}
                    sx={{ 
                    width: 120, 
                    height: 120,
                    border: "3px solid",
                    borderColor: "primary.main",
                    }}
                />
                
                <IconButton 
                    onClick={nextImg}
                    sx={{ 
                    color: "primary.main",
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" }
                    }}
                >
                    <ArrowBigRight fontSize="large" />
                </IconButton>
                </Box>
                
                {/* Name Input */}
                <Box sx={{ mb: 3 }}>
                <Typography sx={{ 
                    mb: 2,
                    color: "white",
                    fontFamily: "Galindo, sans-serif",
                    }} 
                    variant="h6" component="h2" gutterBottom>
                    Enter Your Name
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={playerName}
                    onChange={handleNameChange}
                    placeholder="Murunwa"
                    sx={{ 
                    mb: 2, 
                    color: "white",
                    }}
                />
                </Box>
                
                {/* Submit Button */}
                <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                sx={{
                    py: 1.5,
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    backgroundColor: "#1976d2",
                    "&:hover": { backgroundColor: "#1565c0" },
                    fontFamily: "Galindo, sans-serif",
                }}
                >
                Save and Go
                </Button>
            </Paper>
            </Box>
        </>
    )
}