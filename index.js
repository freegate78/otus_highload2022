const {createServer} = require('http');
const {Server} = require('socket.io');
const express = require('express');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{});
const uuid = require('uuid');
const path = require('path');
const mysql = require('mysql2');
const crypto = require('crypto');
const config = require('./config.json');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('front'));
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

function ChangeUserInfo(body){
    const connection = mysql.createConnection(config.db);
    connection.execute(
        config.query.changeUserInfo,
        [
            body.name,
            body.surname,
            body.hobby,
            body.city,
            body.gender,
            body.age,
            body.username,
            crypto.createHash('sha256').update(body.password).digest('hex')
        ],
        (err)=>{console.log(err)}
    );
    connection.end();
}

function Follow(body){
    const connection = mysql.createConnection(config.db);
    connection.execute(
        config.query.follow,
        [
            body.follower,
            crypto.createHash('sha256').update(body.password).digest('hex'),
            body.followed
        ],
        (err,relatives)=>{
            if(err)console.log(err);
            else if(relatives.length==2){//[follower, followed]
                const connection = mysql.createConnection(config.db);
                connection.execute(
                    config.query.createRelation,
                    [
                        body.followed,
                        body.follower
                    ],
                    (err)=>{if(err)console.log(err)}
                );
                connection.end();
            }
        }
    );
    connection.end();
}

function SearchUser(body){
    const connection = mysql.createConnection(config.db);
    connection.execute(
        config.query.searchUser,
        [body.username],
        (err,user)=>{
            if(err)console.log(err);
            else if(user.length>0){
                io.emit('infoToUser', `

                <h3>Поиск</h3>
                <input type="text" placeholder="username" id="search">
                <button onpointerdown="SearchUser()">Искать</button>
                <h3>Анкета</h3>
                <a id="username">${user[0].username}</a>
                <br></br>
                <a>${user[0].surname}</a>
                <a>${user[0].name}</a>
                <a>${user[0].gender}</a>
                <a>${user[0].age}</a>
                <a>${user[0].hobby}</a>
                <a>${user[0].city}</a>
                <input type="password" placeholder="Пароль" id="password">
                <button onpointerdown="Follow()">Следовать</button>
                <script src="./socket.io.4.5.min.js"></script>
                <script async src="./script.js"></script>

                `);
            }
        }
    );
    connection.end();
}

function SignIn(body){
    const connection = mysql.createConnection(config.db);
    connection.execute(
        config.query.signIn,
        [
            body.username,
            crypto.createHash('sha256').update(body.password).digest('hex')
        ],
        (err,user)=>{
            if(err)console.log(err);
            else if(user.length>0){
                const connection = mysql.createConnection(config.db);
                let followed = [], htmlToUser='';
                connection.execute(
                    config.query.searchFollowed,
                    [body.username],
                    (error,relations)=>{
                        if(error)console.log(error);
                        else if(relations.length>0){
                            for(let i=0;i<relations.length;i++) followed[i] = relations[i].followed;
                        }

                        for(let i=0;i<followed.length;i++) htmlToUser += '<br>' + followed[i];

                        io.emit('setCookie', user[0].username);
                        io.emit('infoToUser', `

                        <h3>Поиск</h3>
                        <input type="text" placeholder="username" id="search">
                        <button onpointerdown="SearchUser()">Искать</button>
                        <h3>Анкета</h3>
                        <a id="username">${user[0].username}</a>
                        <br></br>
                        <input type="text" placeholder="Фамилия" id="surname" value="${user[0].surname}">
                        <input type="text" placeholder="Имя" id="name" value="${user[0].name}">
                        <input type="text" placeholder="Пол" id="gender" value="${user[0].gender}">
                        <input type="text" placeholder="Возраст" id="age" value="${user[0].age}">
                        <input type="text" placeholder="Интересы" id="hobby" value="${user[0].hobby}">
                        <input type="text" placeholder="Город" id="city" value="${user[0].city}">
                        <input type="password" placeholder="Пароль" id="password">
                        <button onpointerdown="SubmitInfo()">Отправить изменения</button>
                        <br></br>
                        <h3>Друзья</h3>
                        ${htmlToUser}
                        <script src="./socket.io.4.5.min.js"></script>
                        <script async src="./script.js"></script>

                        `);
                    }
                );
                connection.end();
            }
        }
    );
    connection.end();
}

function SignUp(body){
    const connection = mysql.createConnection(config.db);
    connection.execute(
        config.query.signUp,
        [
            uuid.v1(),
            body.username,
            crypto.createHash('sha256').update(body.password).digest('hex'),
            body.name,
            body.surname,
            body.hobby,
            body.city,
            body.gender,
            body.age
        ],
        (err)=>{if(err)console.log(err)}
    );
    connection.end();
}

io.on('connection', (socket)=>{
    socket.on('changeUserInfo', ChangeUserInfo);
    socket.on('follow', Follow);
    socket.on('searchUser', SearchUser);
    socket.on('signIn', SignIn);
    socket.on('signUp', SignUp);
});

httpServer.listen(port);
console.log('started on port '+port);



/*
users table 
    [column] [type]

    id varchar(255),
    username varchar(255),
    password varchar(255),
    name varchar(255),
    surname varchar(255),
    hobby varchar(255),
    city varchar(255),
    gender varchar(255),
    age int(255)

-------------------

relations table
    [column] [type]
    follower varchar(255),
    followed varchar(255)

*/