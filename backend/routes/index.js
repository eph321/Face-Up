var express = require('express');
var router = express.Router();
var uniqid = require("uniqid");
var fs = require("fs");
var request = require("sync-request");

var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dptzltk8b',
  api_key: '277189982719455',
  api_secret: 'jPaiD58cIumE0wnaSRL2dDqoNsw'
});



router.post('/upload', async function (req, res, next) {

  var imagePath = "./tmp/" + uniqid() + ".jpg"

  var resultCopy = await req.files.photo.mv(imagePath);

  //resultCopy renvoi false par défaut car il check que le fichier a bien été déplacé du dossier tmp, false correspond au dossier vide donc déplacé
  if (!resultCopy) {
    var result = await cloudinary.uploader.upload(imagePath); // upload de la photo

    var options = {
      json: {
        apiKey: "5c0a5d392c1745d2ae84dc0b1483bfd2",
        image: result.secure_url,
      },
    };

    var resultDetectionRaw = await request("post", 'https://lacapsule-faceapi.herokuapp.com/api/detect', options);
    var resultDetection = resultDetectionRaw.body;
    var resultDetection = await JSON.parse(resultDetection);

    console.log(resultDetection)
    if (resultDetection.result == true) {
      var resultDetectedFaces = resultDetection.detectedFaces[0]
      var resultURL = result.secure_url
      //console.log("faces",resultDetectedFaces)
      var resultData = {
        gender: resultDetectedFaces.gender,
        age: resultDetectedFaces.age,
        url: resultURL,
      }
      //console.log("data",resultData)
      result = resultData;
      console.log(result)
    } 

    res.json({ result: result });
  } else {
    res.json({ result: false, message: resultCopy });
  }
  fs.unlinkSync(imagePath)
})


module.exports = router;
