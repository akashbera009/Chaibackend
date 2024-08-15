import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [jokes, setJokes] = useState([])
  useEffect(()=>{
    axios.get('/api/jokes')
    .then((response)=>{
      setJokes(response.data)    // .data ,  not like other to be handled as json , AXIOS handles it automatic 
    })
    .catch((error)=>{
      console.log(error)
    })
  })

  return (
   <>
   <h1>Going good </h1>
   <p>Jokes:{jokes.length}</p>
   {
    jokes.map((joke,index)=>(
      <div key={joke.id}>
        <h3 id="joke_content">{joke.title}</h3>
        <p >{joke.content}</p>
      </div>
  ))
   }
   </>
  )
}

export default App
