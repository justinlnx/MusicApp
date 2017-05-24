// Initilization: Load the music data js into HTML sections
var globalPlaylistJson = [];
var globalSongJson = [];
var globalUserJson = [];
var sortedArrayByTitle = [];
var sortedArrayByArtist = [];
var playlistJson = function() {
    $.getJSON( "/api/playlists", function(data) {
        updateTabs();

        globalPlaylistJson = [];
        globalSongJson = [];
        sortedArrayByTitle = [];
        sortedArrayByArtist = [];

        initPlaylist(data.playlists);
        initModalBox(data.playlists);
        for(var i = 0; i < data.playlists.length; i++) {
            globalPlaylistJson.push(new playlistItem(data.playlists[i]));
        }

        var playlistBtnList = document.getElementsByClassName("playlist-button");
        setPlaylistBtnEventListener(playlistBtnList);
        setAddPlaylistBtnEventListener();
    }).done(function(){
        songJson();
        userJson();
    });
}
playlistJson();

function playlistItem(playlistJson) {
    this.id = playlistJson.id;
    this.name = playlistJson.name;
    this.songs = playlistJson.songs;
}

function initPlaylist(playlist) {
    for(var i = 0; i < playlist.length; i++) {
        var parentNode = document.getElementById("playlistButtonId");
        var list = document.createElement("li");
        var button = document.createElement("button");
        var image = document.createElement("img");
        var listName = document.createElement("span");
        var arrowIcon = document.createElement("span");

        button.setAttribute("type", "button");
        button.setAttribute("class", "playlist-button");
        image.setAttribute("src", "grey_box.jpg");
        image.setAttribute("alt", "image");
        listName.setAttribute("class", "list-name");
        listName.innerHTML = playlist[i].name;
        arrowIcon.setAttribute("class", "glyphicon glyphicon-chevron-right");

        button.appendChild(image);
        button.appendChild(listName);
        button.appendChild(arrowIcon);
        list.appendChild(button);
        parentNode.appendChild(list);
    }
}

function updateTabs() {
    if(window.location.pathname === '/library'){
        updateNavbarTabs(0);
        setLibraryDefaultSorting();  
        updatePlaylistDetailSection();
    }
    else if(window.location.pathname === '/playlists'){
        updateNavbarTabs(1);
        updatePlaylistDetailSection();
    }
    else if(window.location.pathname === '/search'){
        updateNavbarTabs(2);
        updatePlaylistDetailSection();
    }
}

function initModalBox(playlist) {
    var parentNode = document.getElementById("modal-box-list");
    removeChildNodes(parentNode);

    var ulList = document.createElement("ul");
    ulList.setAttribute("class", "modal-list-ul");

    for(var i = 0; i < playlist.length; i++) {
        var list = document.createElement("li");
        var button = document.createElement("button");
        var listName = document.createElement("span");

        button.setAttribute("type", "button");
        button.setAttribute("class", "modal-playlist-btn");
        listName.setAttribute("class", "list-name");
        listName.innerHTML = playlist[i].name;

        button.appendChild(listName);
        list.appendChild(button);
        ulList.appendChild(list);
    }
    parentNode.appendChild(ulList);
}

function initialUserModalBox(user) {
    var parentNode = document.getElementById("modal-box-list-user");
    removeChildNodes(parentNode);

    var ulList = document.createElement("ul");
    ulList.setAttribute("class", "modal-list-ul-user");

    for(var i = 0; i < user.length; i++) {
        var list = document.createElement("li");
        var button = document.createElement("button");
        var listName = document.createElement("span");

        button.setAttribute("type", "button");
        button.setAttribute("class", "modal-user-btn");
        listName.setAttribute("class", "list-name-user");
        listName.innerHTML =user[i].name;

        button.appendChild(listName);
        list.appendChild(button);
        ulList.appendChild(list);
    }
    parentNode.appendChild(ulList);
}

var songJson = function(){
    $.getJSON( "/api/songs", function(data) {
        initLibrary(data.songs);
        for(var i = 0; i < data.songs.length; i++) {
            globalSongJson.push(new songItem(data.songs[i]));
            sortedArrayByTitle.push(new songItem(data.songs[i]));
            sortedArrayByArtist.push(new songItem(data.songs[i]));

            sortedArrayByTitle.sort(sortItems("title"));
            sortedArrayByArtist.sort(sortItems("artist"));
        }

        var modalClass = document.getElementsByClassName("modal")[0];
        setLibraryAddBtnEventsListener(modalClass);
        setLibraryCloseBtnEventsListener(modalClass);

        var modalBoxPlaylists = document.getElementsByClassName("modal-playlist-btn");

        setModalBoxPlaylistBtnEventListener(modalClass, modalBoxPlaylists);
    });
};

var userJson = function() {
    $.getJSON("/api/users", function(data) {
        initialUserModalBox(data.users);

        for(var i = 0; i < data.users.length; i++) {
            globalUserJson.push(new userItem(data.users[i]));
        }
    })
}

function userItem(userJson) {
    this.id = userJson.id;
    this.name = userJson.name;
}

function songItem(songJson) {
    this.album = songJson.album;
    this.duration = songJson.duration;
    this.title = songJson.title;
    this.id = songJson.id;
    this.artist = songJson.artist;
}

function initLibrary(songs) {
    for(var i = 0; i < songs.length; i++) {
        var parentNode = document.getElementById("songListId");
        var list = document.createElement("li");
        var songItemDiv = document.createElement("div");
        var image = document.createElement("img");
        var songDescDiv = document.createElement("div");
        var title = document.createElement("span");
        var breakLine = document.createElement("br");
        var artist = document.createElement("span");
        var addButton = document.createElement("button");
        var addIcon = document.createElement("span");
        var playButton = document.createElement("button");
        var playIcon = document.createElement("span");


        songItemDiv.setAttribute("class", "song-item");
        image.setAttribute("src", "grey_box.jpg");
        image.setAttribute("alt", "image");
        songDescDiv.setAttribute("class", "song-desc");
        title.setAttribute("class", "title");
        title.innerHTML = songs[i].title;
        artist.setAttribute("class", "artist");
        artist.innerHTML = songs[i].artist;
        addButton.setAttribute("type", "button");
        addButton.setAttribute("class", "add-song-to-list-btn");
        addIcon.setAttribute("class", "glyphicon glyphicon-plus-sign");
        playButton.setAttribute("type", "button");
        playIcon.setAttribute("class", "glyphicon glyphicon-play");

        addButton.appendChild(addIcon);
        playButton.appendChild(playIcon);
        songDescDiv.appendChild(title);
        songDescDiv.appendChild(breakLine);
        songDescDiv.appendChild(artist);
        songItemDiv.appendChild(image);
        songItemDiv.appendChild(songDescDiv);
        songItemDiv.appendChild(addButton);
        songItemDiv.appendChild(playButton);
        list.appendChild(songItemDiv);
        parentNode.appendChild(list);
    }
}
// Set up library song lists

function sortItems(property) {
    return function(a, b) {
        var aItem = a[property].toString();
        var bItem = b[property].toString();
        if(aItem.indexOf("The ", 0) === 0) {
            aItem = aItem.substring(4);
        }
        if(bItem.indexOf("The ", 0) === 0) {
            bItem = bItem.substring(4);
        }

        if(aItem.toLowerCase() < bItem.toLowerCase()) {
            return -1;
        }
        if(aItem.toLowerCase() > bItem.toLowerCase()) {
            return 1;
        }
        return 0;    
    };
}

// ------------ INITIALIZATION ENDS HERE ----------------

// ------------ SWITCH BAR SECTION ----------
var navbarList = document.querySelectorAll("#navbar-list li");
var librarySectionIndex = 0;
var playlistSection = 1;
var searchSection = 2;

navbarList[librarySectionIndex].addEventListener('click', navbarClickCallBack(librarySectionIndex), false);
navbarList[playlistSection].addEventListener('click', navbarClickCallBack(playlistSection), false);
navbarList[searchSection].addEventListener('click', navbarClickCallBack(searchSection), false);

function navbarClickCallBack(index) {
    return function() {
        updateNavbarTabs(index);
        if(index === 0) {
            setLibraryDefaultSorting();  
        }
        updatePlaylistDetailSection();
    };
}

function updateNavbarTabs(index){
    var navbarList = document.querySelectorAll("#navbar-list li");
    var sectionList = document.querySelectorAll(".main-section > section");
    var iconList = document.querySelectorAll("#navbarIcon");
    var iconTextList = document.querySelectorAll("#navbarIconText");
    var sortBtns = document.getElementById("library-sort-btns");
    var addNewPlaylistBtn = document.getElementById("add-new-playlist");
    var searchBar = document.getElementById("search-bar");
    sortBtns.style.display = "none";
    addNewPlaylistBtn.style.display = "none";
    searchBar.style.display = "none";

    for (var i = navbarList.length - 1; i >= 0; i--) {
        if(i !== index) {
            sectionList[i].style.display = "none";
            iconList[i].style.color = "#333";
            iconTextList[i].style.color = "#acacac";
        }
        else {
            sectionList[i].style.display = "block";
            iconList[i].style.color = "#810082";
            iconTextList[i].style.color = "#810082";
        }
    }

    if(index === librarySectionIndex){
        history.pushState(true, "Exercise 1", "/library");
        sortBtns.style.display = "block";
    }
    else if(index === playlistSection){
        history.pushState(true, "Exercise 1", "/playlists");
        addNewPlaylistBtn.style.display = "block";
    }
    else{
        history.pushState(true, "Exercise 1", "/search");
        searchBar.style.display = "block";
    }
}

function setLibraryDefaultSorting(){
    updateSortedSongs(sortedArrayByArtist);
    var librarySortBtnLists = document.querySelectorAll(".librarySortButton");
    librarySortBtnLists[0].style.boxShadow = "-1px 1px 6px black inset";
    librarySortBtnLists[1].style.boxShadow = "none";
}

function updatePlaylistDetailSection() {
    var playlistDetailSection = document.getElementById("playlistDetailSection");
    playlistDetailSection.style.display = "none";
    var modalBoxDiv = document.getElementById("modal-box");
    modalBoxDiv.style.display = "none";
}

// ------- SWITCH BAR ENDS HERE ----------

// ------- LIBRARY SECTION ------------
// Sorting by title or artists, on click events
var librarySortBtnLists = document.querySelectorAll(".librarySortButton");
var sortByArtistIndex = 0;
var sortByTitleIndex = 1;

librarySortBtnLists[sortByArtistIndex].addEventListener('click', librarySortBtnOnClick(sortByArtistIndex), false);
librarySortBtnLists[sortByTitleIndex].addEventListener('click', librarySortBtnOnClick(sortByTitleIndex), false);

function librarySortBtnOnClick(index) {
    return function() {
        for(var i = 0; i < librarySortBtnLists.length; i++) {
            if(i == index) {
                librarySortBtnLists[i].style.boxShadow = "-1px 1px 6px black inset";
            }
            else {
                librarySortBtnLists[i].style.boxShadow = "none";
            }
        }
        if(index === 0) {
            // sort by artists
            updateSortedSongs(sortedArrayByArtist);
        }
        else {
            // sort by title
            updateSortedSongs(sortedArrayByTitle);
        }
    };
}

function updateSortedSongs(sortedArray) {
    var libraryArtistList = document.getElementsByClassName("artist");
    var libraryTitleList = document.getElementsByClassName("title");
    for (var i = 0; i < libraryArtistList.length; i++) {
        libraryArtistList[i].innerHTML = sortedArray[i].artist;
        libraryTitleList[i].innerHTML = sortedArray[i].title;
    }
}

// Library add a song to list Modal Box on click event
function setLibraryAddBtnEventsListener(modal) {
    var addBtnList = document.getElementsByClassName("add-song-to-list-btn");

    for(var i = 0; i < addBtnList.length; i++) {
        var parentNode = addBtnList[i].parentNode;
        addBtnList[i].addEventListener('click', turnOnModalBox(modal, parentNode), false);    
    }
}

function turnOnModalBox(modal, parentNode) {
    return function() {
        modal.style.display = "block";

        // give a special Id to the current active song item
        parentNode.setAttribute("id", "addBtnClicked");
    };
}

function setLibraryCloseBtnEventsListener(modal) {
    var closeBtn = document.getElementsByClassName("close-btn");
    for(var i = 0; i < closeBtn.length; i++) {
        closeBtn[i].addEventListener('click', closeModalBox(modal), false);
    }
}

// Library modal box close btn on click event
function closeModalBox(modal) {
    return function() {
        modal.style.display = "none";
        removeAddBtnClickedAttribute();
    };
}

function removeAddBtnClickedAttribute() {
    var songItem = document.getElementById("addBtnClicked");
    if(songItem !== null) {
        songItem.removeAttribute("id");
    }
}

// Library modal box select playlist on click event
function setModalBoxPlaylistBtnEventListener(modal, modalBoxList) {
    for(var i = 0; i < modalBoxList.length; i++) {
        var playlistName = modalBoxList[i].childNodes[0].innerHTML;
        modalBoxList[i].addEventListener('click', addSongToList(modal, playlistName), false);
    }
}

function addSongToList(modal, playlistName) {
    return function() {
        var songId = getSongIdByAddBtnClickedId();
        var playlistId = getPlaylistIdByName(playlistName);
        if(songId != -1) {
            for(var i = 0; i < globalPlaylistJson.length; i++) {
                if(globalPlaylistJson[i].name == playlistName) {
                    globalPlaylistJson[i].songs.push(songId);
                    var sendJSON = {
                        "song": songId,
                        //"playlistId": playlistId,
                        //"type": "song"
                    }
                    myInsert = true;
                    sendPOSTPlaylistSongRequest(sendJSON, playlistId);
                    break;
                }
            }
        }
        modal.style.display = "none";
        removeAddBtnClickedAttribute();
    };
}

function getPlaylistIdByName(playlistName) {
    for(var i = 0; i < globalPlaylistJson.length; i++) {
        if(globalPlaylistJson[i].name === playlistName)
            return globalPlaylistJson[i].id;
    }
}

function sendPOSTPlaylistSongRequest(sendJSON, playlistId) {
    $.ajax({
        url: '/api/playlists/' + playlistId,
        type: 'POST',
        'Content-type': 'application/json',
        data: sendJSON
    });
}

function getSongIdByAddBtnClickedId() {
    var addBtnClickedId = document.getElementById("addBtnClicked");
    if(addBtnClickedId !== null) {
        var songTitle = addBtnClickedId.childNodes[1].childNodes[0].innerHTML;
        return getSongIdByTitle(songTitle);
    }
    return -1;
}

function getSongIdByTitle(songTitle) {
    for(var i = 0; i < globalSongJson.length; i++) {
        if(globalSongJson[i].title == songTitle)
            return globalSongJson[i].id;
    }
    return -1;
}
// ---------- LIBRARY SECTION ENDS -----------

// ---------- PLAYLIST SECTION ----------
// playlist shows list of songs on click event

var myInsert = false;
var myDelete = false;
var socket = io('/');

// add song to playlist
socket.on('addSongToPlaylist', function(data){
  if (myInsert) {
    myInsert = false;
  }
  else {
    var playlistId = JSON.parse(data).playlist;
    var songId = JSON.parse(data).song;
    for(var i = 0; i < globalPlaylistJson.length; i++) {
        if(globalPlaylistJson[i].id == playlistId) {
            globalPlaylistJson[i].songs.push(songId);

            var updateUI = displayPlaylistDetailSection(globalPlaylistJson[i].name);
            updateUI();
        }
    }
  }

});
// delete a song from playlist
socket.on('deleteSongFromPlaylist', function(data){
  if (myDelete) {
      myDelete = false;
  }
  else {
    var songId = JSON.parse(data).song;
    var playlistId = JSON.parse(data).playlist;
    var songIndex;
    var playlistIndex;
    var playlistName;

    for (var i = 0; i < globalPlaylistJson.length; i++) {
      if (playlistId === globalPlaylistJson[i].id) {
        playlistIndex = i;
        playlistName = globalPlaylistJson[i].name;

        for (var j = 0; j < globalPlaylistJson[playlistIndex].songs.length; j++) {
          if (songId === globalPlaylistJson[playlistIndex].songs[j].id){
            songIndex = j;
          }
        }
        break;
      }
    }

    globalPlaylistJson[playlistIndex].songs.splice(songIndex, 1);

    var updateUI = displayPlaylistDetailSection(playlistName);
    updateUI();
  }
});

function setPlaylistBtnEventListener(playlistBtnList){
    for(var i = 0; i < playlistBtnList.length; i++) {
        var playlistName = playlistBtnList[i].childNodes[1].innerHTML;
        playlistBtnList[i].addEventListener('click', displayPlaylistDetailSection(playlistName), false);
    }
}

function displayPlaylistDetailSection(playlistName) {
    return function() {
        var songDetailListParentNode = document.getElementById("detailSongListId");
        removeChildNodes(songDetailListParentNode);
        setUpPlaylistDetails();

        var header = document.getElementsByClassName("playlist-detail-name")[0];
        header.innerHTML = playlistName;
        var songIds = getPlaylistSongIds(playlistName);

        for(var i = 0; i < songIds.length; i++) {
            var currentSongId = songIds[i];
            createSongElements(currentSongId);
        }

        var userModalClass = document.getElementById("modal-box-user");
        var addUserBtn = document.getElementById("add-user-btn-id");
        addUserBtn.addEventListener('click', turnOnModalBox(userModalClass, addUserBtn.parentNode), false);
        var closeBtn = document.getElementsByClassName("close-btn-user")[0];
        closeBtn.addEventListener('click', closeModalBox(userModalClass), false);
        var modalBoxUserLists = document.getElementsByClassName("modal-user-btn");
        setModalBoxAddUserBtnEventListener(userModalClass, modalBoxUserLists, playlistName);

        var detailAddBtnList = document.getElementsByClassName("list-detail-add-song-to-list-btn");
        for(var j = 0; j < detailAddBtnList.length; j++) {
            var btnParentNode = detailAddBtnList[j].parentNode;
            var modalClass = document.getElementById("modal-box");
            detailAddBtnList[j].addEventListener('click', turnOnModalBox(modalClass, btnParentNode), false);    
        }

        var detailTrashBtnList = document.getElementsByClassName("trash-song-from-list-btn");
        for(var k = 0; k < detailTrashBtnList.length; k++) {
            var songItem = detailTrashBtnList[k].parentNode;
            detailTrashBtnList[k].addEventListener('click', removeSongFromList(songItem), false);
        }
    };
}

function setModalBoxAddUserBtnEventListener(modal, modalBoxList, playlistName) {
    for(var i = 0; i < modalBoxList.length; i++) {
        var username = modalBoxList[i].childNodes[0].innerHTML;
        modalBoxList[i].addEventListener('click', addUserToList(modal, username, playlistName), false);
    }
}

function addUserToList(modal, username, playlistName) {
    return function() {
        var userId = -1;
        for(var i = 0; i < globalUserJson.length; i++) {
            if(globalUserJson[i].name === username)
                userId = globalUserJson[i].id;
        }
        var playlistId = getPlaylistIdByName(playlistName);
        if(userId != -1) {
            var sendJSON = {
                "user": userId,
            }
            sendPOSTUserPlaylistRequest(sendJSON, playlistId);
        }
        modal.style.display = "none";
    };
}

function sendPOSTUserPlaylistRequest(sendJSON, playlistId) {
    $.ajax({
        url: '/api/playlists/' + playlistId + '/users',
        type: 'POST',
        'Content-type': 'application/json',
        data: sendJSON
    });
}

function removeChildNodes(parentNode) {
    while(parentNode.hasChildNodes()) {
        parentNode.removeChild(parentNode.firstChild);
    }
}

function setUpPlaylistDetails() {
    var playlistSection = document.getElementById("playlistSection");
    playlistSection.style.display = "none";

    var playlistDetailSection = document.getElementById("playlistDetailSection");
    playlistDetailSection.style.display = "block";
}

function getPlaylistSongIds(playlistName) {
    for(var i = 0; i < globalPlaylistJson.length; i++) {
        if(globalPlaylistJson[i].name == playlistName) {
            return globalPlaylistJson[i].songs;
        }
    }
    return new Array(0);
}

function createSongElements(songId) {
    for(var i = 0; i < globalSongJson.length; i++) {
        var songItem = globalSongJson[i];
        if(songItem.id == songId) {
            var parentNode = document.getElementById("detailSongListId");
            var list = document.createElement("li");
            var songItemDiv = document.createElement("div");
            var image = document.createElement("img");
            var songDescDiv = document.createElement("div");
            var title = document.createElement("span");
            var breakLine = document.createElement("br");
            var artist = document.createElement("span");
            var addButton = document.createElement("button");
            var addIcon = document.createElement("span");
            var playButton = document.createElement("button");
            var playIcon = document.createElement("span");
            var removeButton = document.createElement("button");
            var removeIcon = document.createElement("span");

            songItemDiv.setAttribute("class", "song-item");
            image.setAttribute("src", "grey_box.jpg");
            image.setAttribute("alt", "image");
            songDescDiv.setAttribute("class", "song-desc");
            title.setAttribute("class", "list-detail-song-title");
            title.innerHTML = songItem.title;
            artist.setAttribute("class", "list-detail-song-artist");
            artist.innerHTML = songItem.artist;
            addButton.setAttribute("type", "button");
            addButton.setAttribute("class", "list-detail-add-song-to-list-btn");
            addIcon.setAttribute("class", "glyphicon glyphicon-plus-sign");
            playButton.setAttribute("type", "button");
            playIcon.setAttribute("class", "glyphicon glyphicon-play");
            removeButton.setAttribute("type", "button");
            removeButton.setAttribute("class", "trash-song-from-list-btn");
            removeIcon.setAttribute("class", "glyphicon glyphicon-remove");

            addButton.appendChild(addIcon);
            playButton.appendChild(playIcon);
            removeButton.appendChild(removeIcon);
            songDescDiv.appendChild(title);
            songDescDiv.appendChild(breakLine);
            songDescDiv.appendChild(artist);
            songItemDiv.appendChild(image);
            songItemDiv.appendChild(songDescDiv);
            songItemDiv.appendChild(removeButton);
            songItemDiv.appendChild(addButton);
            songItemDiv.appendChild(playButton);
            list.appendChild(songItemDiv);
            parentNode.appendChild(list);
        }
    }
}

function removeSongFromList(songItem) {
    return function() {
        var playlistDetailsSection = document.getElementById("playlistDetailSection");
        var playlistHeader = playlistDetailsSection.children[1];
        var playlistName = playlistHeader.children[0].innerHTML;
        var playlistId = getPlaylistIdByName(playlistName);

        var songDesc = songItem.children[1];
        var songTitle = songDesc.firstChild.innerHTML;
        var songId = getSongIdByTitle(songTitle);

        var sendJSON = {
            "song": songId
        }
        myDelete = true;
        sendDELETESongFromPlaylistRequest(sendJSON, playlistId);

        var songItemParent = songItem.parentNode;
        songItemParent.parentNode.removeChild(songItemParent);
        removeSongIdFromGlobalPlaylistSongIdList(playlistId, songId);
    };
}

function removeSongIdFromGlobalPlaylistSongIdList(playlistId, songId) {
    for(var i = 0; i < globalPlaylistJson.length; i++) {
        if(globalPlaylistJson[i].id == playlistId) {
            var index = globalPlaylistJson[i].songs.indexOf(songId);
            if(index > -1) {
                globalPlaylistJson[i].songs.splice(index, 1);
            }
        }
    }
}

function sendDELETESongFromPlaylistRequest(sendJSON, playlistId) {
    $.ajax({
        url: '/api/playlists/' + playlistId,
        type: 'DELETE',
        'Content-type': 'application/json',
        data: sendJSON
    });
}

function setAddPlaylistBtnEventListener(){
    var addPlaylistBtn = document.getElementById("add-new-playlist-btn");
    addPlaylistBtn.addEventListener('click', setUpModalBoxForAddNewPlaylist, false);
}

function setUpModalBoxForAddNewPlaylist(){
    createAddPlaylistModalBoxContent();
    var modalClass = document.getElementById("add-new-playlist-modal");
    modalClass.style.display = "block";

    var closeBtn = document.getElementById("add-new-playlist-close-btn");
    closeBtn.addEventListener('click', closeModalBox(modalClass), false);

    setUpSaveBtnEventListener();
}

function createAddPlaylistModalBoxContent(){
    var parentNode = document.getElementById("playlistSection");
    var modalDiv = document.createElement("div");
    var modalWrapperDiv = document.createElement("div");
    var modalHeader = document.createElement("div");
    var headerText = document.createElement("span");
    var modalCloseBtn = document.createElement("button");
    var modalCloseIcon = document.createElement("span");
    var inputBox = document.createElement("input");
    var button = document.createElement("button");

    modalDiv.setAttribute("class", "modal");
    modalDiv.setAttribute("id", "add-new-playlist-modal");
    modalWrapperDiv.setAttribute("class", "modal-wrapper");
    modalWrapperDiv.setAttribute("id", "add-new-playlist-modal-wrapper");
    modalHeader.setAttribute("class", "modal-header");
    modalHeader.setAttribute("id", "add-new-playlist-modal-box-header");
    headerText.setAttribute("class", "modal-header-text");
    headerText.setAttribute("id", "add-new-playlist-modal-box-header-text");
    headerText.innerText = "Create New Playlist";
    modalCloseBtn.setAttribute("type", "button");
    modalCloseBtn.setAttribute("class", "close-btn");
    modalCloseBtn.setAttribute("id", "add-new-playlist-close-btn");
    modalCloseIcon.setAttribute("class", "glyphicon glyphicon-remove");
    inputBox.setAttribute("type", "text");
    inputBox.setAttribute("id", "add-new-playlist-input");
    button.setAttribute("type", "button");
    button.setAttribute("class", "save-new-playlist-btn");
    button.innerHTML = "Save";

    modalCloseBtn.appendChild(modalCloseIcon);
    modalHeader.appendChild(headerText);
    modalHeader.appendChild(modalCloseBtn);
    modalWrapperDiv.appendChild(modalHeader);
    modalWrapperDiv.appendChild(inputBox);
    modalWrapperDiv.appendChild(button);
    modalDiv.appendChild(modalWrapperDiv);
    parentNode.appendChild(modalDiv);
}

function setUpSaveBtnEventListener(){
    var inputBox = document.getElementById("add-new-playlist-input");
    var saveBtn = document.getElementsByClassName("save-new-playlist-btn")[0];
    saveBtn.addEventListener('click', postNewPlaylist(inputBox), false);
}

function postNewPlaylist(inputBox){
    return function() {
        var playlistName = inputBox.value;
        var sendJSON = {
            //"id": globalPlaylistJson.length,
            "name": playlistName,
            //"songs": [],
            //"type": "playlist"
        }
        sendPOSTRequest(sendJSON);

        var modalClass = document.getElementById("add-new-playlist-modal");
        removeChildNodes(modalClass);
        modalClass.parentNode.removeChild(modalClass.parentNode.lastChild);

        ReloadPlaylist();
    }
}

function sendPOSTRequest(sendJSON){
    $.ajax({
        url: '/api/playlists',
        type: 'POST',
        'Content-type': 'application/json',
        data: sendJSON
    });
}

function ReloadPlaylist() {
    var playlistLists = document.getElementById("playlistButtonId");
    var songlistLists = document.getElementById("songListId");
    removeChildNodes(playlistLists);
    removeChildNodes(songlistLists);

    playlistJson();
}
// ---------- PLAYLIST SECTION ENDS -----------

// ---------- SEARCH SECTION ----------
var searchInput = document.getElementById("serachInputId");
searchInput.addEventListener("keyup", onKeyupSearchInput, false);

function onKeyupSearchInput() {
    var searchInputValue = searchInput.value;
    updateSearchResult(searchInputValue);
    defineOnClickEvents();
}

function updateSearchResult(value) {
    clearSearchSection();

    if(value !== "") {
        for(var i = 0; i < globalPlaylistJson.length; i++) {
            var playlistName = globalPlaylistJson[i].name;
            if(playlistName.toLowerCase().includes(value.toLowerCase())) {
                populatePlaylistResult(globalPlaylistJson[i].name);
            }
        }

        for(var j = 0; j < globalSongJson.length; j++) {
            var songTitle = globalSongJson[j].title;
            var songArtist = globalSongJson[j].artist;
            if(songTitle.toLowerCase().includes(value.toLowerCase()) || songArtist.toLowerCase().includes(value.toLowerCase())) {
                populateSongResult(globalSongJson[j]);
            }
        }
    }
}

function clearSearchSection() {
    var searchResultList = document.getElementById("search-result-id");
    removeChildNodes(searchResultList);
}

function populatePlaylistResult(playlistName) {
    var parentNode = document.getElementById("search-result-id");
    var list = document.createElement("li");
    var button = document.createElement("button");
    var image = document.createElement("img");
    var listName = document.createElement("span");
    var arrowIcon = document.createElement("span");

    button.setAttribute("type", "button");
    button.setAttribute("class", "search-playlist-button");
    image.setAttribute("src", "grey_box.jpg");
    image.setAttribute("alt", "image");
    image.setAttribute("class", "playlist-img");
    listName.setAttribute("class", "list-name");
    listName.innerHTML = playlistName;
    arrowIcon.setAttribute("class", "glyphicon glyphicon-chevron-right");

    button.appendChild(image);
    button.appendChild(listName);
    button.appendChild(arrowIcon);
    list.appendChild(button);
    parentNode.appendChild(list);
}

function populateSongResult(songItem) {
    var parentNode = document.getElementById("search-result-id");
    var list = document.createElement("li");
    var songItemDiv = document.createElement("div");
    var image = document.createElement("img");
    var songDescDiv = document.createElement("div");
    var title = document.createElement("span");
    var breakLine = document.createElement("br");
    var artist = document.createElement("span");
    var addButton = document.createElement("button");
    var addIcon = document.createElement("span");
    var playButton = document.createElement("button");
    var playIcon = document.createElement("span");
    
    songItemDiv.setAttribute("class", "song-item");
    image.setAttribute("src", "grey_box.jpg");
    image.setAttribute("alt", "image");
    image.setAttribute("class", "song-img");
    songDescDiv.setAttribute("class", "song-desc");
    title.setAttribute("class", "search-song-title");
    title.innerHTML = songItem.title;
    artist.setAttribute("class", "search-song-artist");
    artist.innerHTML = songItem.artist;
    addButton.setAttribute("type", "button");
    addButton.setAttribute("class", "search-add-song-to-list-btn");
    addIcon.setAttribute("class", "glyphicon glyphicon-plus-sign");
    playButton.setAttribute("type", "button");
    playIcon.setAttribute("class", "glyphicon glyphicon-play");

    addButton.appendChild(addIcon);
    playButton.appendChild(playIcon);
    songDescDiv.appendChild(title);
    songDescDiv.appendChild(breakLine);
    songDescDiv.appendChild(artist);
    songItemDiv.appendChild(image);
    songItemDiv.appendChild(songDescDiv);
    songItemDiv.appendChild(addButton);
    songItemDiv.appendChild(playButton);
    list.appendChild(songItemDiv);
    parentNode.appendChild(list);
}

function defineOnClickEvents() {   
    var searchPlaylistBtn = document.getElementsByClassName("search-playlist-button");
    for(var i = 0; i < searchPlaylistBtn.length; i++) {
        var playlistSectionIndex = 1;
        var playlistName = searchPlaylistBtn[i].childNodes[1].innerHTML;
        searchPlaylistBtn[i].addEventListener('click', navbarClickCallBack(playlistSectionIndex), false);
        searchPlaylistBtn[i].addEventListener('click', displayPlaylistDetailSection(playlistName), false);    
    }

    var songListBtn = document.getElementsByClassName("search-add-song-to-list-btn");
    for(var j = 0; j < songListBtn.length; j++) {
        var btnParentNode = songListBtn[j].parentNode;
        var modalClass = document.getElementById("modal-box");
        songListBtn[j].addEventListener('click', turnOnModalBox(modalClass, btnParentNode), false);
    }
}
// ---------- SEARCH SECTION ENDS ----------
