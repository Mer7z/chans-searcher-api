const express = require('express');
// const _ = require('lodash');
const cors = require('cors');
const fetch4chan = require('./fetch4chan.js');

const app = express();

const allowedOrigins = ["https://mer7z.github.io", "http://localhost:5173", "http://192.168.0.110:5173", "http://127.0.0.1:5500"]

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  })
)

const PORT = process.env.PORT || 8080

async function startServer() {
  // await fetch4chan.init();
  var boardsArr = fetch4chan.boards; //All boards

  //refresh
  // const refresh = () =>{
  //   setTimeout(async () => {
  //     const init = await fetch4chan.init();
  //     boardsArr = fetch4chan.boards;
  //     refresh()
  //   }, 300000);
  // }

  // refresh();

  app.get('/', async (req, res) => {
    let threads = await getThreads();
    let result = [];
    
    if(req.query.q){
      const search = req.query.q;
      threads.forEach(thread => {
        const teaser = thread.teaser;
        const subject = thread.teaser;
        const condition = (typeof teaser === 'string' && teaser?.toLowerCase().includes(search?.toLowerCase())) || (typeof subject === 'string' && subject?.toLowerCase().includes(search?.toLowerCase()))
  
        if (condition) {
          result.push(thread);
        }
      })
    } else{
      result = threads;
    }
    res.json(result);
  })

  app.get('/:board', async (req, res) =>{
    const board = req.params.board;
    let threads = await getThreads(board);
    let result = [];

    if(req.query.q){
      const search = req.query.q;
      threads.forEach(thread => {
        const teaser = thread.teaser;
        const subject = thread.sub;
        const condition = (teaser?.toLowerCase().includes(search?.toLowerCase())) || (typeof subject === 'string' && subject?.toLowerCase().includes(search?.toLowerCase()))
  
        if (condition) {
          result.push(thread);
        }
      })
    } else{
      result = threads;
    }

    res.json(result);
  })

  //refresh
  const refresh = () =>{
    setTimeout(async () => {
      const init = await fetch4chan.init();
      boardsArr = fetch4chan.boards;
      refresh()
    }, 300000);
  }

  //get threads
  const getThreads = async (b = "") => {
    let threads = [];
    if (b === "all" || b === "") {
      if(boardsArr.length === 0){
        await fetch4chan.init()
        boardsArr = fetch4chan.boards
        refresh()
      }
      boardsArr.forEach(board => {
        if(board.threads){
          threads = [...threads, ...board.threads]
        }
      });
      return threads;
    } else {
      threads = await fetch4chan.loadThreads(b)
      return threads;
    }

  }  

  app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });
}

startServer();
