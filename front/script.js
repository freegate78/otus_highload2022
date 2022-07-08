const socket = io();


function Follow(){
    let user = {
        follower: GetCookie('username'),
        followed: document.getElementById('username').innerHTML,
        password: document.getElementById('password').value,
    }
    socket.emit('follow', user);
}

function GetCookie(name){
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function SearchUser(){
    let user = {
        username: document.getElementById('search').value,
    }
    socket.emit('searchUser', user);
}

function SignIn(){
    let user = {
        username: document.getElementById('usernameIn').value,
        password: document.getElementById('passwordIn').value,
    };
    socket.emit('signIn', user);
}

function SignUp(){
    let user = {
        username: document.getElementById('usernameUp').value,
        password: document.getElementById('passwordUp').value,
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        gender: document.getElementById('gender').value, 
        age: document.getElementById('age').value,
        hobby: document.getElementById('hobby').value,
        city: document.getElementById('city').value,
    };
    socket.emit('signUp', user);
}

function SubmitInfo(){
    let user = {
        username: document.getElementById('username').innerHTML,
        password: document.getElementById('password').value,
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        gender: document.getElementById('gender').value, 
        age: document.getElementById('age').value,
        hobby: document.getElementById('hobby').value,
        city: document.getElementById('city').value,
    };
    socket.emit('changeUserInfo', user);
}

socket.on('setCookie', (username)=>{
    document.cookie = `username=${username}`;
});

socket.on('infoToUser', (html)=>{
    document.body.innerHTML = html;
});