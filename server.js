const express = require('express');
const _ = require('lodash');
const cors = require('cors');
const fetch4chan = require('./fetch4chan.js');

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://192.168.0.110:5173", "http://192.168.0.109", "http://localhost:8080"]

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
  const fetchInit = await fetch4chan();
  var boardsArr = fetch4chan.boards();

  //refresh
  const refresh = () =>{
    setTimeout(async () => {
      const init = await fetch4chan();
      boardsArr = fetch4chan.boards();
      refresh()
    }, 300000);
  }

  refresh();

  app.get('/', (req, res) => {
    let threads = getThreads();
    let result = [];
    
    if(req.query.q){
      const search = req.query.q;
      threads.forEach(thread => {
        const teaser = thread.teaser;
        const subject = thread.teaser;
        const condition = teaser.includes(" "+_.lowerCase(search)+" ") ||
          teaser.includes(" "+_.upperCase(search)+" ") ||
          teaser.includes(" "+_.upperFirst(search)+" ") ||
          teaser.includes(" "+search+" ") || subject.includes(" "+_.lowerCase(search)+" ") ||
          subject.includes(" "+_.upperCase(search)+" ") ||
          subject.includes(" "+_.upperFirst(search)+" ") ||
          subject.includes(" "+search+" ");
  
        if (condition) {
          result.push(thread);
        }
      })
    } else{
      result = threads;
    }
    res.json(result);
  })

  app.get('/:board', (req, res) =>{
    const board = req.params.board;
    let threads = getThreads(board);
    let result = [];

    if(req.query.q){
      const search = req.query.q;
      threads.forEach(thread => {
        const teaser = thread.teaser;
        const subject = thread.teaser;
        const condition = teaser.includes(_.lowerCase(search)) ||
          teaser.includes(_.upperCase(search)) ||
          teaser.includes(_.upperFirst(search)) ||
          teaser.includes(search) || subject.includes(_.lowerCase(search)) ||
          subject.includes(_.upperCase(search)) ||
          subject.includes(_.upperFirst(search)) ||
          subject.includes(search);
  
        if (condition) {
          result.push(thread);
        }
      })
    } else{
      result = threads;
    }

    res.json(result);
  })


  //get threads
  const getThreads = (b = "") => {
    let threads = [];
    if (b === "all" || b === "") {
      boardsArr.forEach(board => {
        if(board.threads){
          board.threads.forEach(thread => {
            threads.push(thread);
          });
        }
      });
      return threads;
    } else {
      boardsArr.forEach(board => {
        if (board.board === b) {
          threads = board.threads;
        }
      });
      return threads;
    }

  }  

  app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });
}

startServer();
