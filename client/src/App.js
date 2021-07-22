import './App.css';
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from 'react'
import Peer from 'peerjs'

const socket = io('http://localhost:3001') // replace with your own URL

function App() {
  const divRef = useRef()
  const inputRef = useRef()
  const [peer, setPeer] = useState(null)
  const [connectTo, setConnectTo] = useState([])
  const [connected, setConnected] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const user = new Peer(undefined, {
      host: 'localhost',
      port: 3001,
      path: 'chat',
      debug: 3,
    });

    user.on('open', (id) => {
      console.log('PEER OPENED', id)
      setPeer(user)
      socket.emit('join-room', id)
    })

    user.on('connection', (conn) => {
      console.log('Got Connection from ', conn.peer);
      conn.on('data', (data) => {
        setMessages(messages => [...messages, data])
      })
      setConnected((connected) => [...connected, conn])
    })

  },[])

  useEffect(() => {
    socket.on('user-connected', (id) => {
      console.log('A user connected message from server', id)
      setMessages((messages) => [...messages, `User with ID: ${id} joined`])
      setConnectTo((connectTo) => [...connectTo, id])
    })
   }, [])

   const sendMessage = (to, message) => {
      to.send(message)
   }

   const sendMessageToConnected = (message) => {
     connected.forEach(conn => {
       sendMessage(conn, message)
     })
   }

   useEffect(() => {
     if (!peer) {
       return
     }
     const newConnectTo = connectTo
      newConnectTo.forEach((id, index) => {
        const connect = peer.connect(id)
        connect.on('open', () => {
          console.log('NEW CONNECTION ESTABLISHED', connect)
          setConnected((connected) => [...connected, connect])
        })

        connect.on('data', (data) => {
          setMessages(messages => [...messages, data])
        });
 
        delete newConnectTo[index]
      })

      console.log('TO CONNECT TO', connectTo)

      setConnectTo(newConnectTo)
   }, [connectTo, peer])


  return (
    <div className="App">
      <header className="App-header">
        <h2>WELCOME TO THE CHAT</h2>
        <div className='messages' ref={divRef}>
          <p>You received {messages.length} Messages </p>
          {
              messages.map((message, index) => <p key={index}>{message}</p>)
          }
        
        </div>
        <form onSubmit={(e) => { e.preventDefault()}}>
          <input type='text' name='msg' ref={inputRef} />
          <button onClick={() => {
            sendMessageToConnected(inputRef.current.value)
          }}>Submit</button>
        </form>
      </header>
    </div>
  );
}

export default App;
