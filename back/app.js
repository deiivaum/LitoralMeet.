const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const path = require('path');

// Imports das rotas
const authRoutes = require('./routes/authRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');

// Configurações básicas
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', authRoutes);
app.use('/api/events', galeriaRoutes);

app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use(express.static(path.join(__dirname, '../frontend/html')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});