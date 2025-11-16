const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de autenticacao no ar!');
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
