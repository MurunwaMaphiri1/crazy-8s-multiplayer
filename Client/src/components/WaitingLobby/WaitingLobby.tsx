import { useEffect, useState } from "react";
import { Avatar, Paper, Typography } from "@mui/material";
import type { Player } from "../../../../Shared/utils/interface";

type WaitingLobbyProps = {
  lobbyPlayers : Player[];
}

export default function WaitingLobby({ lobbyPlayers }: WaitingLobbyProps) {
  const [countdown, setCountdown] = useState(3);
  const [showLobby, setShowLobby] = useState(true);

  useEffect(() => {
    if (lobbyPlayers.length >= 2) {
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
  }, [lobbyPlayers]);

  if (!showLobby) return null;

  return (
    <>
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
            Players Joined: {lobbyPlayers.length}/2
          </Typography>
          <div className="">
              {lobbyPlayers.map((player) => (
                <div className="flex flex-col items-center mb-4">
                  <Avatar
                    src={player.avatar}
                    alt={player.name}
                    sx={{ width: 80, height: 80, mb: 1 }}
                  />
                    <Typography variant="h6" sx={{ color: "white" }}>
                      {player.name}
                    </Typography>
                </div>
            ))}
          </div>
          {lobbyPlayers.length >= 2 && (
            <Typography variant="h5" sx={{ color: "yellow" }}>
              Starting in {countdown}...
            </Typography>
          )}
        </Paper>
      </div>
    </>
  );
}
