const _ = require("lodash");

class SongRequestQueue {
  constructor() {
    this.active = [];
    this.inactive = [];
    this.currentSong = null;
    this.previousSong = null;
  }

  isEmpty() {
    return this.active.length === 0;
  }

  getLength() {
    return this.active.length;
  }

  peek() {
    return _.get(this, "active.[0]", undefined);
  }

  previous() {
    return _.get(this, "previousSong.song");
  }

  current() {
    return _.get(this, "currentSong.song");
  }

  topSongs(count) {
    return this.active.slice(0, count);
  }

  removeSong(index) {
    const removedSong = this.active[index];
    this.active = [].concat(
      this.active.slice(0, index),
      this.active.slice(index + 1),
    );
    this.printTerminal();
    return removedSong;
  }

  formatRequest(request) {
    if (!request) return "N/A";
    return `${request.song}  (${request.requester})`;
  }

  makeRequestList(array) {
    let list = "";
    for (let i = 0; i < array.length; i++) {
      list += `	${i + 1}. ${this.formatRequest(array[i])}\n`;
    }
    if (!list.length) list = "	N/A\n";
    return list;
  }

  printTerminal() {
    let nextSongStr = `${this.formatRequest(this.peek())}`;
    process.stdout.write("\x1Bc");
    console.log(
      `Inactive Queue:\n` +
        `${this.makeRequestList(this.inactive)}` +
        `\nActive Queue:\n` +
        `${this.makeRequestList(this.active)}` +
        `\n\nPrevious Song: ${this.formatRequest(this.previousSong)}`,
    );
    console.log(
      "\x1b[31m%s\x1b[0m",
      `Current song: ${this.formatRequest(this.currentSong)}`,
    );
    console.log(
      `Next Song: ${nextSongStr}` + `\n\nPress (n) for the next song`,
    );
  }

  enqueue(requester, song) {
    this.active.push({ requester, song });
    this.printTerminal();
  }

  nextSong() {
    const song = this.active.shift();
    this.previousSong = this.currentSong || this.previousSong;
    this.currentSong = song;
    this.printTerminal();
    return song;
  }

  swapArrays(fromArray, toArray, requester) {
    for (let i = 0; i < fromArray.length; i++) {
      if (fromArray[i].requester.toLowerCase() === requester.toLowerCase()) {
        toArray.push(fromArray[i]);
        fromArray.splice(i, 1);
        i--;
      }
    }
  }

  userLeft(user) {
    this.swapArrays(this.active, this.inactive, user);
  }

  userReturned(user) {
    this.swapArrays(this.inactive, this.active, user);
  }

  updateQueues(currentUsers) {
    currentUsers.forEach((user) => {
      this.userReturned(user);
    });

    const previousUsers = this.active.map((request) => request.requester);
    const leftUsers = previousUsers.filter((previousUser) => {
      return currentUsers.indexOf(previousUser.toLowerCase()) < 0;
    });
    leftUsers.forEach((user) => {
      this.userLeft(user);
    });
    this.printTerminal();
  }
}

module.exports = SongRequestQueue;
