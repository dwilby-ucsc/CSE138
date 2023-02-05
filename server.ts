
import express, { Express, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';

dotenv.config();
const forwarding_address = process.env.FORWARDING_ADDRESS;
const port = 13800;

const app: Express = express();

if(forwarding_address) {
  app.use('/', proxy(forwarding_address));  
}

app.use(express.json());

type HashMap = { [key: string]: string };

const kvs: HashMap = {};

app.delete('/kvs', (req: Request, res: Response) => {

  if(!req.body || !req.body.key)
    return res.status(400).json({ error: "bad DELETE" });

  if(req.body.key in kvs) {
    
    const prev = kvs[req.body.key];
    
    delete kvs[req.body.key];

    return res.status(200).json({ prev });
  }

  return res.status(404).json({ error: "not found" });
});

app.get('/kvs', (req: Request, res: Response) => {

  if(!req.body || !req.body.key)
    return res.status(400).json({ error: "bad GET" });

  if(req.body.key in kvs)
    return res.status(200).json({ val: kvs[req.body.key] });

  return res.status(404).json({ error: "not found" });

});

app.put('/kvs', (req: Request, res: Response) => {

  if(!req.body || !req.body.key || !req.body.val)
    return res.status(400).json({ error: "bad PUT" });

  if(req.body.key.length > 200 || req.body.val.length > 200)
    return res.status(400).json({ error: "key or val too long" })

  if(req.body.key in kvs) {

    const prev = kvs[req.body.key];
    kvs[req.body.key] = req.body.val
    res.status(200);
    return res.json({ replaced: true, prev });

  }

  kvs[req.body.key] = req.body.val;

  res.status(201);
  return res.json({ replaced: false });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
  console.log(`This instance is a ${forwarding_address ? "follower" : "main"} instance.`);
});
