const apiKey = "078e29f77346516d20b3bce807f5a1c4";
let artistName = "";
let artistid = "";
let trackList = [];
let numOfTracks = 0;
let albumName = "";
let artistImage = "";

document.addEventListener('DOMContentLoaded', function () {
    const manualButton = document.getElementById("manual-artist");
    manualButton?.addEventListener('click', function() {
        document.getElementById("manual-artist-select").style.display = "flex";
    })
});

//Artist Button
document.addEventListener('DOMContentLoaded', function () {
    const artistButton = document.getElementById("submit-artist");
    artistButton?.addEventListener('click', async function() {
        startTrackQuiz();
    })
});

document.addEventListener('DOMContentLoaded', function () {
    const trackButton = document.getElementById("submit-track");
    trackButton?.addEventListener('click', function() {
        checkTrack();
    })
})

document.addEventListener('DOMContentLoaded', function () {
    const albumButton = document.getElementById("submit-album");
    albumButton?.addEventListener('click', function() {
        checkAlbum();
    })
});

$(document).ready(function(){
    $('input-track').keypress(function(e){
      if(e.keyCode==13)
      $('submit-track').click();
    });
});

async function startTrackQuiz() {
    const artist = document.getElementById("input-artist").value;
        const artistSearchData = await fetchArtistSearch(artist, apiKey);
        const artistExists = doesArtistExist(artist, artistSearchData);
        if (artistExists[0]) {
            artistid = artistExists[1];
            let albumData = await fetchArtistAlbums(artistid, apiKey);
            console.log(albumData);
            artistImage = getMostPopularAlbumImage(albumData)
            document.getElementById("artist-image").src = artistImage;
            const artistTracksData = await fetchArtistTracks(artistExists[1], apiKey);
            trackList = getTrackNames(artistTracksData);
            document.getElementById("artist-name").textContent = artistName;
            document.getElementById("track-game").style.display = "flex";
            document.getElementById("homepage").style.display = "none";
            const timer = setInterval(updateSeconds, 1000);
        }
        else {
            document.getElementById("artist-exists").textContent = `We can't find an aritst named ${artist}. Make sure you spelled their name right and try again.`
        }
}

function checkTrack() {
    const track = document.getElementById("input-track").value;
        let validTrack = inTrackList(track, trackList)
        console.log(validTrack);
        if (validTrack[0]) {
            document.getElementById(`track-notif`).textContent = `${validTrack[1]} is a ${artistName} track.`
            numOfTracks += 1;
            console.log(numOfTracks);
            document.getElementById(`track-${numOfTracks}`).textContent = validTrack[1];

            if (numOfTracks == 5) {
                startAlbumQuiz();
            }
        }
        else {
            document.getElementById(`track-notif`).textContent = `${track} is not a ${artistName} track.`
        }
}

function checkAlbum() {
    const userAlbum = document.getElementById("input-album").value;
        if (albumName.toLowerCase() == userAlbum.toLowerCase()) {
            document.getElementById("album-game").style.display = "none";
            document.getElementById("artist-name1").textContent = artistName;
            document.getElementById("good-end").style.display = "block";
        }
        else {
            document.getElementById("album-notif").textContent = `${userAlbum} is not the name of the album.`;
        }
}





async function fetchArtistSearch(artist, apiKey) {
    const result = await fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artist}&api_key=${apiKey}&format=json`);

    return result.json();
}

function doesArtistExist(artist, searchData) {
    if (searchData.results) {
        const artistResults = searchData.results.artistmatches.artist;
        console.log(artistResults)
        for (let i = 0; i < artistResults.length; i++) {
            if (artistResults[i].name.toLowerCase() == artist.toLowerCase())
                if (artistResults[i].mbid) {
                    artistName = artistResults[i].name;
                return [true, artistResults[i].mbid];
                }
        }
    }
    return [false, ""];
}

async function fetchArtistTracks(artistid, apiKey) {
    const result = await fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid=${artistid}&api_key=${apiKey}&limit=2000&format=json`);

    return result.json();
}

async function fetchArtistInfo(artistid, apiKey) {
    
    const result = await fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=${artistid}&api_key=${apiKey}&format=json`);

    return result.json();
}

async function fetchArtistAlbums(artistid, apiKey) {
    const result = await fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artistid}&api_key=${apiKey}&limit=10&format=json`);

    return result.json();
}

function selectRandomAlbum(albumData) {
    if (albumData.topalbums.album) {
        const albums = albumData.topalbums.album;
        const randomIndex = Math.floor(Math.random() * albums.length-1)+1;
        const albumName = albums[randomIndex].name;
        const albumImageArr = albums[randomIndex].image;
        const albumImage = albumImageArr[albumImageArr.length - 1];
        return [albumName, albumImage];
    }
    return ["", ""];
}

function getMostPopularAlbumImage(albumData) {
    if (albumData.topalbums.album) {
        const albums = albumData.topalbums.album;
        const albumImageArr = albums[0].image;
        const retImg = albumImageArr[albumImageArr.length - 1];
        return retImg["#text"];
    }
    return "";
}
function getTrackNames(trackData) {
    let ret = [];
    const arr = trackData.toptracks.track;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].playcount > 1000) {
            ret.push(arr[i].name);
        }
    }
    return ret;
}


function inTrackList(track, trackList) {
    for (let i = 0; i < trackList.length; i++) {
        if (track.toLowerCase() == trackList[i].toLowerCase()) {
            return [true, trackList[i]];
        }
    }
    return [false, ""];
}

async function startAlbumQuiz() {
    let albumData = await fetchArtistAlbums(artistid, apiKey);
    console.log(albumData);
    let album = selectRandomAlbum(albumData);
    albumName = album[0];
    let albumImage = album[1]["#text"]
    document.getElementById("album-image").src = albumImage;
    document.getElementById("track-game").style.display = "none";
    document.getElementById("album-game").style.display = "block";
}


function updateSeconds() {
    const secondsSpan = document.getElementById('seconds');
    let seconds = parseInt(secondsSpan.textContent);
    seconds--;
    secondsSpan.textContent = seconds;
    if (seconds == 0) {
        console.log("ZERO!")
    }
}
