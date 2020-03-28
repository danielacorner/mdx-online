import React from "react";
import { useParams } from "react-router";

export default () => {
  const params = useParams();
  const deckData = params.deckData;
  const decodedDeckData = decodeURI(deckData);

  var fs = require("browserify-fs");

  fs.mkdir("/home", function() {
    fs.writeFile("/home/hello-world.txt", "Hello world!\n", function() {
      fs.readFile("/home/hello-world.txt", "utf-8", function(err, data) {
        console.log(data);
      });
    });
  });

  return <div>{decodedDeckData}</div>;
};
