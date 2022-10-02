const express = require("express");
const multer = require("multer");
const data = require("./store");
require("dotenv").config({ path: __dirname + "/.env" });
const app = express();
const upload = multer();
const port = 3000;

app.use(express.static("./templates"));
app.set("view engine", "ejs");
app.set("views", "./templates");

const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.aws_access_key_id,
  SecretAccessKey: process.env.aws_secret_access_key,
  region: process.env.aws_region,
});
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "Company";

app.get("/", (req, res) => {
  const params = {
    TableName: tableName,
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.render("index", { data: data.Items });
    }
  });
});
app.get("/them", (req, res) => {
  const params = {
    TableName: tableName,
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.render("them", {data:data.Items});
    }
  });
});
app.post("/them", upload.fields([]), (req, res) => {
  const { id, name } = req.body;
  const params = {
    TableName: tableName,
    Item: {
      id: parseInt(id),
      name,
    },
  };
  docClient.put(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.redirect("/them");
    }
  });
});

app.get("/:company_id", (req, res) => {
  const { company_id } = req.params;
  const params = {
    TableName: tableName,
    KeyConditionExpression: "#id =:company_id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":company_id": parseInt(company_id),
    },
  };
  docClient.query(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.render("company", { data: data.Items[0] });
    }
  });
});

app.post("/delete", upload.fields([]), (req, res) => {
  const { id } = req.body;
  const params = {
    TableName: tableName,
    Key: {
      id: parseInt(id),
    },
  };
  docClient.delete(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.redirect("/");
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
