require('dotenv/config');
const express = require('express');
const cors = require('cors');
const file = require('express-fileupload');
const app = express();

app.use(express.json());
app.use(cors());
app.use(file());

require('./user/routes/mahasiswa.route')(app);
require('./user/routes/panitia.route')(app);
require('./home/routes/home.route')(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`Listening to the server ${PORT}`);
}); 