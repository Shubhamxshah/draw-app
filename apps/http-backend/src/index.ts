import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get("/", (_, res) => {
  res.send("hello shubham from server")
})

app.listen(PORT, () => {
  console.log(`server listening on PORT ${PORT}`);
});
