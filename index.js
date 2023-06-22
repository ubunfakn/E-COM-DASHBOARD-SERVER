const express = require("express");
const cors = require("cors");
const connect = require("../E-DASHBOARD/MongoDB_Config/Config");
const User = require("../E-DASHBOARD/MongoDB_Config/Users");
const Product = require('../E-DASHBOARD/MongoDB_Config/Products');
const Jwt = require('jsonwebtoken');
const jwtKey = 'ecom'

const app = express();

app.use(express.json());
app.use(cors());

app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let data = await user.save();
  data = data.toObject();
  delete data.password;
  Jwt.sign({data:data},jwtKey,(err,token)=>{
    if(!err){
      resp.send({data, token});
    }else{
      resp.send()
    }
  })
});

app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
      let user = await User.findOne(req.body).select("-password");
      if(user)
      {
          Jwt.sign({user:user},jwtKey,(err,token)=>{
            if(!err){
              resp.send({user,token});
            }else{
              resp.send()
            }
          })
      }
      else
      {
          resp.send();
      }
  } 
  else 
  {
    resp.send(404);
  }
});

app.post("/getuser", verifyToken, async (req, resp)=>{
  let user = await User.findOne(req.body).select("-password");
  resp.send(user ? user : {err: true});
})

app.post('/add_product', verifyToken, async (req, resp)=>{
  let product = new Product(req.body);
  // console.log(req.body);
  let result = await product.save();
  resp.send(result);
})

app.get(`/get_products/:uId`,verifyToken, async (req,resp)=>{
  let products= await Product.find({userId:req.params.uId});
  if(products.length>0){
    resp.send(products);
  }else{
    resp.status(404).send({result:'No Products Found'})
  }
})

app.get('/get_product/:id',verifyToken, async (req, resp)=>{
  const id = req.params.id;
  console.log(id)
  let product = await Product.findOne({_id:id});
  resp.send(product);
})

app.delete('/delete/:uId/:id',verifyToken, async (req,resp)=>{
  const id = req.params.id;
  console.log(id);
  const result = await Product.deleteOne({userId:req.params.uId,_id:id});
  resp.send(result);
})

app.put('/update/:id',verifyToken, async (req,resp)=>{
  const id = req.params.id;
  const data = req.body;
  console.log(data);
  console.log(id);
  const result = await Product.updateOne({_id:id},{
    $set : data
  })
  resp.send(result);
})

app.get('/search/:uId/:key',verifyToken, async (req, resp)=>{
  let result = await Product.find({
    "$or" :
    [
      {
        name:{$regex:req.params.key}
      },
      {
        brand:{$regex:req.params.key}
      },
      {
        category:{$regex:req.params.key}
      },
    ],
    userId:req.params.uId
  })
  resp.send(result);
})

app.get('/getproduct/user_id/:uId',verifyToken, async (req,resp)=>{
  let id = req.params.uId
  console.log(id);
  let products = await Product.find({userId:id});
  if(products.length>0)resp.send(String(products.length));
  else resp.send(404);
})

function verifyToken(req, resp, next){
  const token = req.headers['authorization'];
  console.log(token);
  if(token)
  {
    Jwt.verify(token,jwtKey,(err,success)=>{
      if(err){
        resp.status(401).send()
      }else{
        next();
      }
    })
  }else{
    resp.status(400).send();
  }
}

app.listen(8080);
