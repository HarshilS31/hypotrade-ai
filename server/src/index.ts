import express from "express"
import dns from "dns"
import dotenv from "dotenv"
import cors from "cors"
import apiRoutes from './routes/api.routes.js'
dotenv.config()
dns.setServers(['8.8.8.8','8.8.4.4'])
const app = express()
app.use(express.json())
app.use(cors({
  origin: [process.env.ALLOWED_ORIGIN as string, 'http://localhost:5173'],
  credentials: true
}))
app.use('/api',apiRoutes)
const PORT = process.env.PORT || 5000;
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
})
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})