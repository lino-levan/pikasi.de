import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { socket } from '../../lib/socket'

const Admin: NextPage = () => {
  const [screen, setScreen] = useState("lobby")
  const [names, setNames] = useState<string[]>([])
  const [side, setSide] = useState<string[]>(["loading...", "loading..."])
  const [poll, setPoll] = useState([0, 0])
  const [question, setQuestion] = useState(0)
  const [stats, setStats] = useState({
    votesCast: 0,
    players: 0
  })

  const router = useRouter()
  const { id } = router.query

  useEffect(()=>{
    socket.emit('claimOwner', id)

    socket.on('names', (names)=>{
      setNames(names)
    })

    socket.on('poll', (poll) => {
      setPoll(poll)
    })

    socket.on('side', (side) => {
      setSide(side)
    })

    socket.on('stats', (stats) => {
      setScreen('stats')
      setStats(stats)
    })
  }, [id])

  return (
    <div>
      <Head>
        <title>Pikaside</title>
        <meta name="description" content="A quick app to do opinion polls on large groups of people" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-sky-200 w-screen h-screen flex flex-col gap-4 justify-center items-center select-none">
        {
          screen === "lobby" &&
          <>
            <h1 className="text-6xl w-max p-4 rounded bg-sky-50 absolute ml-auto mr-auto bg-opacity-50 select-none animate-pulse z-10">pikasi.de/{id}</h1>
            <div className='w-full h-full overflow-auto'>
              {
                names.map((name, i)=>(
                  <div key={name} className='inline-block text-xl p-4 h-min animate-pulse hover:line-through cursor-pointer select-none' onClick={()=>{
                    let modifiedNames = names.slice()
                    modifiedNames.splice(i, 1)
                    setNames(modifiedNames)
                  }}>{name}</div>
                ))
              }
            </div>
            <div className='w-full p-4'>
              <button className='text-xl bg-sky-300 p-4 rounded' onClick={()=>{
                socket.emit('start', id)
                socket.emit('getSide', id, 0)
                setScreen('game')
              }}>Start</button>
            </div>
          </>
        }
        {
          screen === "game" &&
          <>
            <div className='w-full h-full grid grid-cols-2'>
              <div className="flex flex-col justify-center items-center text-center">
                <h1 className='text-5xl'>⬅️</h1>
                <h1 className='text-3xl'>{side[0]}</h1>
                <h2 className='text-8xl'>{poll[0]}</h2>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <h1 className='text-5xl'>➡️</h1>
                <h1 className='text-3xl'>{side[1]}</h1>
                <h2 className='text-8xl'>{poll[1]}</h2>
              </div>
            </div>
            <div className='w-full p-4'>
              <button className='text-xl bg-sky-300 p-4 rounded' onClick={()=>{
                socket.emit('getSide', id, question+1)
                setQuestion(question+1)
                setScreen('game')
              }}>Next</button>
            </div>
          </>
        }
        {
          screen === "stats" &&
          <>
            <h1 className='text-6xl'>Fun Stats</h1>
            <h2 className='text-3xl'>Total Players: {stats.players}</h2>
            <h2 className='text-3xl'>Votes Cast: {stats.votesCast}</h2>
          </>
        }
      </main>
    </div>
  )
}

export default Admin