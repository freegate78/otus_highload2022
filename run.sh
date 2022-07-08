sudo apt install node
sudo apt install mysql-server
sudo service mysql start
mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
CREATE DATABASE testdb;
USE testdb;
CREATE TABLE users(
    id varchar(255),
    username varchar(255),
    password varchar(255),
    name varchar(255),
    surname varchar(255),
    hobby varchar(255),
    city varchar(255),
    gender varchar(255),
    age int(255)
);
CREATE TABLE relations(
    follower varchar(255),
    followed varchar(255)
);
exit
sudo service mysql restart
npm i express
npm i uuid
npm i mysql2
npm i node
npm i crypto-js
npm i socket.io
node index.js