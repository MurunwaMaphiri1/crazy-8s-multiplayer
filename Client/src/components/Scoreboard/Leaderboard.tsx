import styled from "styled-components"
import type { Player } from "../../../../Shared/utils/interface";
import { Paper, Typography } from "@mui/material";
import FirstPlace from "../../../public/Images/Medals/1st Place.png"
import { useNavigate } from "react-router-dom";

const Root = styled.div`
    .row {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 20px;
        
        .order {
            width: 50px;
            font-size: 1.5rem;
        }

        .avatar {
            width: 40px;
            border-radius: 50px
        }
    }
`

type ScoreboardProps = {
    leaderboard: Player[];
    playerId: string;
}

export default function Scoreboard({ leaderboard, playerId }: ScoreboardProps) {
    const navigate = useNavigate();

    if (!leaderboard || leaderboard.length == 0) {
        return null;
    }

    const handlePlayAgain = () => {
        navigate("/")
    }

    function getMedal(index: number) {
        if (index === 1) return FirstPlace;
    }

    return (
        <>
            <Root>
                <div className="flex flex-col justify-center items-center mx-auto max-w-2xl min-h-screen p-4">
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "#1e2d4d",
                            color: "white"
                        }}
                    >
                        <div className="">
                            <Typography
                                variant="body1"
                                gutterBottom
                                sx={{
                                    fontWeight: "normal",
                                    color: "white",
                                    fontFamily: "MarkinLt, sans-serif",
                                    fontSize: "1.5rem",
                                    marginBottom: "30px"
                                }}
                            >
                                Ranking
                            </Typography>
                        </div>
                            {leaderboard.map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`row ${player.id === playerId ? "me" : ""}`}
                                >
                                    <div className="order">{index + 1}</div>
                                    <img className="avatar" src={player.avatar} alt={player.name} />
                                    <div className="text-white w-[150px] text-[25px]">{player.name}</div>
                                    <img className="w-[30px]" src={getMedal(index + 1)} />
                                </div>
                            ))}
                            <div className="mt-5 justify-center items-center flex">
                                <button
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-xl"
                                    onClick={handlePlayAgain}
                                >
                                    Play Again
                                </button>
                            </div>
                    </Paper>
                </div>
            </Root>
        </>
    )
}