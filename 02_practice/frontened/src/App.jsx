import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [jokes, setJokes] = useState([])
  useEffect(()=>{ 
    axios.get('/api/jokes')
    .then((response)=>{
      setJokes(response.data)
    })
    .catch((error)=>{
      console.log(error);
      
    })
  })

  return (
   <>
   <h1>Pracrive Today Best Jokes</h1>
   <p>so today will be {jokes.length} jokes ....</p>
   <p id ="container">
    {
      jokes.map((joke)=>(
        <div key={joke.id} id ="container2"> 
                <div id="title">{joke.id}. {joke.title}</div>
                <p>{joke.content}</p>
        </div>
      ))
    }
   </p>
   </>
  )
}

export default App
