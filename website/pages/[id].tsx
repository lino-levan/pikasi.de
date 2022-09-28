import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { socket } from '../lib/socket'

const Participant: NextPage = () => {
  const [screen, setScreen] = useState("name")
  const [name, setName] = useState("")
  const [option, setOption] = useState(0)

  const router = useRouter()
  const { id } = router.query

  useEffect(()=>{
    socket.on('start', ()=>{
      setScreen('game')
    })

    socket.on('reset', ()=>{
      setOption(0)
    })

    socket.on('over', ()=>{
      setScreen('over')
    })
  }, [])

  return (
    <div>
      <Head>
        <title>Pikaside</title>
        <meta name="description" content="A quick app to do opinion polls on large groups of people" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-sky-200 w-screen h-screen flex flex-col gap-4 justify-center items-center">
        {
          screen === "name" &&
          <>
            <h1 className="text-6xl italic motion-safe:animate-bounce">Pikasi.de</h1>
            <div className='flex gap-4'>
              <input placeholder="My Awesome Name" value={name} className="bg-sky-100 px-4 py-2 rounded text-3xl" onChange={(e)=>{
                setName(e.target.value)
              }}/>
              <button className="h-full bg-sky-300 p-4 rounded" onClick={()=>{
                socket.emit('join', id, name)
                setScreen('lobby') // lobby
              }}>Go!</button>
            </div>
          </>
        }
        {
          screen === "lobby" &&
          <>
            <h1 className="text-3xl motion-safe:animate-bounce">Check out your name on the screen!</h1>
          </>
        }
        {
          screen === "game" &&
          <>
            <div className='flex justify-between items-center w-full h-full p-4'>
              <button className={`w-1/3 text-6xl h-full rounded ${option===-1?'bg-sky-500':'bg-sky-300'}`} onClick={()=>{
                if(option !== 0) return

                setOption(-1)
                socket.emit('pick', id, name, 0)
              }}>⬅️</button>
              <h1 className="text-3xl motion-safe:animate-bounce text-center">Pik-a-side!</h1>
              <button className={`w-1/3 text-6xl h-full rounded ${option===1?'bg-sky-500':'bg-sky-300'}`} onClick={()=>{
                if(option !== 0) return

                setOption(1)
                socket.emit('pick', id, name, 1)
              }}>➡️</button>
            </div>
          </>
        }
        {
          screen === "over" &&
          <>
            <h1 className="text-3xl motion-safe:animate-bounce">Thanks for playing!</h1>
          </>
        }
      </main>
    </div>
  )
}

export default Participant