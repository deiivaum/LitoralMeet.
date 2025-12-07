const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');
const path = require('path');

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}))


app.use('/api/auth', authRoutes);

app.use('/api/events', galeriaRoutes);

app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
// Serve a pasta de JS na URL /js
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
// Serve os HTMLs na raiz
app.use(express.static(path.join(__dirname, '../frontend/html')));

app.get('/', (req, res) => {
    // Aponta para o index.html, onde colocamos o código de listar eventos
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
