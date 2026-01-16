const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionMiddleware = session({
    secret: 'mon secret tres secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
});

app.use(sessionMiddleware);

// Share session with Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Socket.IO connection
io.on('connection', (socket) => {
    const userId = socket.request.session.userId;
    if (userId) {
        socket.join(`user_${userId}`);
    }

    socket.on('sendMessage', async (data) => {
        try {
            const Message = require('./models/Message');
            const Conversation = require('./models/Conversation');
            
            const message = new Message({
                conversation: data.conversationId,
                sender: userId,
                senderName: data.senderName,
                content: data.content
            });
            
            await message.save();
            
            await Conversation.findByIdAndUpdate(data.conversationId, {
                lastMessage: data.content.substring(0, 50),
                lastMessageAt: new Date()
            });

            // Emit to all participants
            const conversation = await Conversation.findById(data.conversationId);
            conversation.participants.forEach(p => {
                io.to(`user_${p.user}`).emit('newMessage', {
                    conversationId: data.conversationId,
                    message: message
                });
            });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/jobs', require('./routes/jobRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
app.use('/feed', require('./routes/postRoutes'));
app.use('/search', require('./routes/searchRoutes'));

app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});