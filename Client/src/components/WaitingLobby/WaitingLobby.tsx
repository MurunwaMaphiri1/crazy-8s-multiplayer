import { useEffect, useState } from "react";
import { useGameStore } from "../../../zustand/store";
import { Paper, Typography } from "@mui/material";

export default function WaitingLobby() {
  const players = useGameStore((state) => state.players);
  const [countdown, setCountdown] = useState(3);
  const [showLobby, setShowLobby] = useState(true);

    useEffect(() => {
        initOnlinePlayer();
    }, [initOnlinePlayer]);

  useEffect(() => {
    if (players.length >= 2) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        setShowLobby(false);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [players]);

  if (!showLobby) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1f3d] p-4">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          pt: 8,
          width: "100%",
          maxWidth: 700,
          textAlign: "center",
          borderRadius: 2,
          backgroundColor: "#1e2d4d",
        }}
      >
        <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
          Waiting Lobby
        </Typography>
        <Typography variant="body1" sx={{ color: "white", mb: 2 }}>
          Players Joined: {players.length}/2
        </Typography>
        {players.length >= 2 && (
          <Typography variant="h5" sx={{ color: "yellow" }}>
            Starting in {countdown}...
          </Typography>
        )}
      </Paper>
    </div>
  );
}
