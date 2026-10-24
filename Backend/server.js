import express from "express"
import {createServer, get, METHODS} from "http"

import {Server} from "socket.io"
import {YSocketIO} from "y-socket.io/dist/server"

const app=express()

app.use(express.static("public"))
const httpserver=createServer(app)


const io=new Server(httpserver,{
    cors:{
        origin:"*",
        methods:["GET","post"]
    }
})

const ySocketIO=new YSocketIO(io)
ySocketIO.initialize()

// app.get("/",(req,res)=>{
//     res.status(200).json({
//         message:"hello world",
//         success:true
//     })
// })

app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"server is healthy",
        success:true
    })
})

httpserver.listen(3000,()=>{
    console.log("server is running on port 3000")
})