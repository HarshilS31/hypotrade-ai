import app from './index.js';
import dns from "dns"
import dotenv from "dotenv"
dotenv.config()
dns.setServers(['8.8.8.8','8.8.4.4'])
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
