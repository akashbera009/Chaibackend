# connected frontened with backend
 
 made a local server using express and aslo frontned using React 

 defined some jokes in the index.js file, and using the 'api/jokes' those are fetched 
 now in  the frontned these were supposed to be presented , but a problem arise named proxy ..
 
 # CORS
 A security protocol to check if the request is coming from the same network

 ## proxy network

 the request from frontened to the server treats the request as a third party ,
 proxy solve the problem by pretending the request from the same network 
  also at a time it auto-complete the link /api/jokes -> https://localhost:3000/api/jokes

    There are also CORS library saperately, but here cors is achieved using proxy network 