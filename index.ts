import express from "express";
import bodyParser from 'body-parser'
import apiRoutes from "./src/routes/api";

const app = express()
const port = process.env.PORT || 8081

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api', apiRoutes)

app.listen(port, () => console.log(`Server Successfully running on port ${port}`))