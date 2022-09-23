const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = "https://boards.4chan.org/";

var boards = [];
const boardsLetters = [];


module.exports = init;
module.exports.boards = () =>{
  return boards;
};

async function init(){
  boards = [];
  const refresh = await refreshBoards();
}

async function refreshBoards(){
  console.log('Updating')
  if(boardsLetters.length === 0){
    const response = await axios.get(url + 'b');
    let $ = cheerio.load(response.data);
    const letters = $("#boardNavDesktop .boardList a").each((i, a) =>{
      const letter = $(a).text();
      boardsLetters.push(letter);
    });
  }
  for(const board of boardsLetters){
    if(board !== 'f'){
      const threads = await load(board);
      boards.push({board, threads});
    }
  }

  // boards.forEach(async (board) =>{
  //   board.threads = await load(board.board);
  // })
}

async function load(board){
  try {
    const response = await axios.get(url + board + '/catalog');
    var $ = cheerio.load(response.data);
  } catch (e) {
    return null;
  }
  let threads = [];
  const script = $('head script').last().text();
  const threadJSON = script.substring(script.search('catalog') + 10, script.search('var style_group') - 1);
  const catalog = JSON.parse(threadJSON);
  Object.keys(catalog.threads).forEach(thread =>{
    const threadObj = catalog.threads[thread];
    const resultObj = {
      link: `https://boards.4chan.org/${board}/thread/${thread}`,
      sub: threadObj.sub,
      teaser: threadObj.teaser,
      replies: threadObj.r,
      imgReplies: threadObj.i,
      board
    }
    threads.push(resultObj);
  })

  return threads;
}