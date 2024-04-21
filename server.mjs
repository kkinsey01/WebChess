import express from 'express'
import * as path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import WebSocket, { WebSocketServer } from 'ws'
import ChessGame from './public/chessGame.mjs'
import http from 'http'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const SECRET = 'lucky42';

main().catch(err => console.log(err));

var connection;

async function main() {
    connection = await mongoose.connect("mongodb://127.0.0.1:27017/Chess");
    console.log('Connected');
}

main();

const schema = new mongoose.Schema({
    username: String,
    pwd_hash: String,
    pwd_salt: String
}, {collection: 'Users'});

const model = mongoose.model('Users', schema);

const app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.redirect('/signup');
})

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/signup.html'))
})

app.post('/signup', async (req, res) => {
    const { username, pwd, pwd_confirm} = req.body;
    if (!username || !pwd || !pwd_confirm) 
    {
        return res.status(200).send({ msg: 'Invalid data'});
    }
    if (pwd != pwd_confirm) 
    {
        return res.status(200).send({ msg: "Passwords don't match"});
    }
    try {
        const existingUser = await model.findOne({ username });
        if (existingUser) {
            return res.status(400).send({ msg: 'Username already exists' });
        }

        const user_salt = crypto.randomBytes(16).toString('hex');
        const user_hash = crypto.pbkdf2Sync(pwd, user_salt, 100000, 64, 'sha512').toString('hex');

        const newUser = new model({
            username,
            pwd_hash: user_hash,
            pwd_salt: user_salt
        });
        await newUser.save();

        console.log('Document inserted successfully');
        return res.status(200).send({ msg: 'Successfully created account.' });
    } catch (err) {
        console.log('Error: ', err);
        return res.status(500).send({ msg: 'Internal Server Error' });
    }
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
})

app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
})

app.post('/login', function (req, res, next) {

    console.log("in server login post");
    const {username, pwd} = req.body;
    model.find({ username: username}).then(data => {
        if (data.length === 0) {
            res.status(200).send({ msg: 'No user found' });
        }
        else {
            const userData = data[0];
            let login_hash = crypto.pbkdf2Sync(pwd, userData.pwd_salt, 100000, 64, 'sha512').toString('hex');
            if (login_hash !== userData.pwd_hash)
            {
                return res.sendStatus(400).send({ msg: "Password doesn't match"});
            }
            else {
                const payload = { user: userData.username};
                const secret = SECRET;
                const options = { expiresIn: '1h'};

                const token = jwt.sign(payload, secret, options);

                res.cookie('jwt', token, { maxAge: 3600000, httpOnly: true});
                console.log('set cookie');
                res.sendFile(path.join(__dirname , 'public/landing.html'));
            }
        }
    })
})
function authenticate(req, res, next) {
    console.log('authentication middleware');

    if (!req.cookies && 'jwt' in req.cookies === false) {
        console.log(' JWT cookie missing');
        res.redirect('/login');
        return;
    }
    let token = req.cookies.jwt;
    try {
        let payload = jwt.verify(token, SECRET);
        req.payload = payload;
    } catch (err) {
        console.log(` invalid JWT ${err}`);
        res.redirect('/login');
        return;
    }

    next();
}
app.get('/secure', authenticate, (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public/secure.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

//----------------------------------------------------------------------------------

// let opengames = [];
// const allgames = [];

// const server = http.createServer(app);
// const wss = new WebSocketServer({server});

// // WebSocket connection handling
// wss.on('connection', function connection(ws) {
//     console.log('Client connected to sock');
//     if(opengames.length > 0)
//     {
//         opengames[0].players[1] = ws;
//         ws.send(opengames[0].gameId);
//         opengames.shift();
//     }
//     else
//     {
//         game = new ChessGame();
//         game.players.push(ws);
//         opengames.push(game);
//         allgames.push(game);
//         ws.send('GID ' + game.gameId)
//     }



    
//     // Handle incoming moves from client
//     ws.on('message', function incoming(message) {
        
//         //send move to other opponent client
        
//     });

  
//     ws.on('close', function() {
//         console.log('Client disconnected');
//     });
// });