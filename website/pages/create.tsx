import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { socket } from '../lib/socket'

const Create: NextPage = () => {
  useEffect(()=>{
    socket.on('create', (code)=>{
      location.href = `/admin/${code}`
    })

    socket.emit('create')
  }, [])

  return (
    <div>
      <Head>
        <title>Pikaside</title>
        <meta name="description" content="A quick app to do opinion polls on large groups of people" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>

      </main>
    </div>
  )
}

export default Create
