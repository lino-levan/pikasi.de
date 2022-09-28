import { Server } from "socket.io";
import { createServer } from "https";
import { readFileSync } from "fs";
import * as dotenv from 'dotenv';
dotenv.config()

const https = process.env?.CERT

const options = {
  cors: {
    origin: '*'
  }
}

const httpServer = https ? createServer({
  key: readFileSync(process.env.KEY),
  cert: readFileSync(process.env.CERT)
}) : null

const io = https ? new Server(httpServer, options) : new Server(options);

const sides = [
  ["As a child, Jack identified more with his mother.", "As a child, Jack identified more with his father."],
  ["The best origami animal is the Water Buffalo", "The best origami animal is the Tiger"],
  ["Jack is mostly a good person", "Jack is mostly a bad person"],
  ["The central theme of \"The Paper Menagerie\" is culture", "The central theme of \"The Paper Menagerie\" is identity"],
  ["By the end of the story, Jack has learned the importance of family", "By the end of the story, Jack has not learned the importance of family"],
  ["The following phrase is discriminatory: \"Make yourselves at home. My wife doesn’t speak much English, so don’t think she’s being rude for not talking to you.\"", "The following phrase is helpful: \"Make yourselves at home. My wife doesn’t speak much English, so don’t think she’s being rude for not talking to you.\""],
  ["Jack became more American because of bullying and indoctrination", "Jack became more American because he had a weak mindset"],
  ["Mark is racist and sinophobic", "Mark is a product of the culture of the mid 1980s"],
  ["Jack's mother was in the right for not trying to worry her family", "Jack's mother was in the wrong for downplaying her symptoms"],
  ["Jack's mother was actually happy to be in Connecticut", "Jack's mother was not happy being in Connecticut"],
  ["If I read Jack's mother's letter, I would be mad at Jack for his behavior", "If I read Jack's mother's letter, I would give my condolences to Jack"],
  ["This short story made me cry", "This short story did not make me cry (I have no emotions)"],
]

let games: Record<string, {
  names: string[],
  owner: string,
  curQuestion: number,
  poll: number[],
  stats: {
    votesCast: number,
    players: number
  }
}> = {}

io.on("connection", (socket) => {

  /* Admin-side code */
  socket.on('create', () => {
    let code = (Math.random() + 1).toString(36).substring(7)
    while(games.hasOwnProperty(code)) {
      code = (Math.random() + 1).toString(36).substring(7)
    }

    console.log('Game created', code)

    games[code] = {
      names: [],
      owner: socket.id,
      curQuestion: 0,
      poll: [0, 0],
      stats: {
        votesCast: 0,
        players: 0
      }
    }

    socket.emit('create', code)
  })

  socket.on('start', (code) => {
    if(!games.hasOwnProperty(code)) return
    if(games[code].owner !== socket.id) return

    io.to(code).emit('start')
  })

  socket.on('claimOwner', (code) => {
    if(!games.hasOwnProperty(code)) return

    games[code].owner = socket.id

    console.log("Game claimed owner by", socket.id)
  })

  socket.on('getSide', (code, num) => {
    if(!games.hasOwnProperty(code)) return
    if(num+1 > sides.length) {
      socket.emit('stats', games[code].stats)
      io.to(code).emit('over')

      delete games[code]
      return
    }

    games[code].curQuestion = num
    games[code].poll = [0, 0]


    socket.emit('side', sides[num])
    socket.emit('poll', games[code].poll)

    io.to(code).emit('reset')
  })

  /* Client-side code */
  socket.on('join', (code, name) => {
    if(!games.hasOwnProperty(code)) return

    socket.join(code)

    games[code].names.push(name)
    games[code].stats.players++

    console.log("Game joined by", name)

    io.to(games[code].owner).emit('names', games[code].names)
  })

  socket.on('pick', (code, name, vote)=> {
    if(!games.hasOwnProperty(code)) return

    games[code].poll[vote]++
    games[code].stats.votesCast++

    io.to(games[code].owner).emit('poll', games[code].poll)
  })
})

if(https) {
  console.log("Listening securely!")
  httpServer.listen(14513)
} else {
  console.log("Listening insecurely!")
  io.listen(14513)
}
