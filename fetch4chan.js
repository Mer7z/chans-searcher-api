const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = "https://boards.4chan.org/";

var boards = [];
const boardsLetters = [];


module.exports = {
  init,
  get boards() {
    return boards
  },
  loadThreads
}

async function init(){
  boards = [];
  await refreshBoards();
}

async function refreshBoards(){
  console.log('Updating')
  if(boardsLetters.length === 0){
    const response = await axios.get(url + 'b');
    let $ = cheerio.load(response.data);
    $("#boardNavDesktop .boardList a").each((i, a) =>{
      const letter = $(a).text();
      boardsLetters.push(letter);
    });
  }
  for(const board of boardsLetters){
    if(board !== 'f'){
      const threads = await loadThreads(board);
      boards.push({board, threads});
    }
  }
}

async function loadThreads(board){
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
      board,
      author: threadObj.author,
      imgurl: `https://i.4cdn.org/${board}/${threadObj.imgurl}s.jpg`
    }
    threads.push(resultObj);
  })

  return threads;
}