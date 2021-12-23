const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const async = require('hbs/lib/async')
const app = express()
const {MongoClient,ObjectId} = require('mongodb')


const DATABASE_URL = 'mongodb+srv://anhtu_159:anhtu123@anhtu.we8yk.mongodb.net/test'
const DATABASE_NAME = 'datatoy'

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))

app.post('/edit',async (req,res)=>{
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    const id = req.body.txtId
    
    const myquery = { _id: ObjectId(id) }
    const newvalues = { $set: {name: nameInput, price: priceInput,picURL:picURLInput } }
    const dbo = await getDatabase()
    await dbo.collection("Toys").updateOne(myquery,newvalues)
    res.redirect('/')
})

app.get('/edit',async (req,res)=>{
    const id = req.query.id
    //truy cap database lay product co id o tren
    const dbo = await getDatabase()
    const toyToEdit = await dbo.collection("Toys").findOne({_id:ObjectId(id)})
    res.render('edit',{toy:toyToEdit})
})

app.get('/',async(req,res)=>{
    
    const dbo = await getDatabase()
    const results = await dbo.collection("Toys").find({}).sort({name:1}).limit(7).toArray()
    res.render('home', {Toys:results})
})

app.get('/insert',(req,res)=>{
    res.render('toy')
})

app.get('/delete',async (req,res)=>{
    const id = req.query.id
    console.log("id can xoa:"+ id)
    const dbo = await getDatabase()
    await dbo.collection("Toys").deleteOne({_id:ObjectId(id)})
    res.redirect('/')
})

app.get('/view',async (req,res)=>{
    //1. lay du lieu tu Mongo
    const dbo = await getDatabase()
    const results = await dbo.collection("Toys").find({}).sort({name:1}).limit(7).toArray()
    //2. hien thi du lieu qua HBS
    res.render('view',{Toys:results})
    // res.render('home',{Toys:results})
})

app.post('/toy',async (req,res)=>{
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    if(isNaN(priceInput)==true){
        //Khong phai la so, bao loi, ket thuc ham
        const errorMessage = "Gia phai la so!"
        const oldValues = {name:nameInput,price:priceInput,picURL:picURLInput}
        res.render('toy',{error:errorMessage,oldValues:oldValues})
        return;
        
    }
    const newP = {name:nameInput,price:Number.parseFloat(priceInput),picURL:picURLInput}

    const dbo = await getDatabase()
    const result = await dbo.collection("Toys").insertOne(newP)
    console.log("Gia tri id moi duoc insert la: ", result.insertedId.toHexString());
    res.redirect('/')
})




const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log('Server is running!')

async function getDatabase() {
    const client = await MongoClient.connect(DATABASE_URL)
    const dbo = client.db(DATABASE_NAME)
    return dbo
}

