import { useEffect, useState } from "react";

function Tournament(){

const [tournaments,setTournaments] = useState([]);
const userEmail = localStorage.getItem("userEmail");

useEffect(() => {

  const token = localStorage.getItem("token");

  fetch("http://127.0.0.1:5000/tournament/all", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    setTournaments(data);
  });

}, []);

const handleJoin = (id) => {

  const token = localStorage.getItem("token");

  fetch(`http://127.0.0.1:5000/tournament/join/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
  });

};

return(

<div style={{textAlign:"center"}}>

<h1>Available Tournaments 🎮</h1>

{tournaments.map((t) => {

  const isFull = t.players?.length >= t.max_players;
  const alreadyJoined = t.players?.includes(userEmail);

  return (

    <div
      key={t.id}
      style={{
        border: "1px solid black",
        margin: "20px",
        padding: "20px",
        width: "300px",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >

      <h3>{t.name}</h3>

      <p>Game: {t.game}</p>
      <p>Entry Fee: ₹{t.entry_fee}</p>
      <p>Prize Pool: ₹{t.prize_pool}</p>
      <p>Date: {t.date}</p>

      <p>
        Players Joined: {t.players?.length} / {t.max_players}
      </p>

      <button
        onClick={() => handleJoin(t.id)}
        disabled={alreadyJoined || isFull}
      >
        {alreadyJoined
          ? "Already Joined"
          : isFull
          ? "Tournament Full"
          : "Join Tournament"}
      </button>

    </div>

  )

})} 

</div>

)

}

export default Tournament;


