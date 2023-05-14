const express = require("express")
const app = express()
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1',require('./routes/moviesRoutes'));
app.use(function(req, res) {
    res.status(404);
    res.send({'message':'Wrong Path',success:false,data:{}});
});
const port = 5000||3000
app.listen(port,()=>{
    console.log(`Sever is running on port ${port}`)
});