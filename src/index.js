import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Deck from "./components/Deck";

const AppWithRouter = () => (
  <BrowserRouter>
    <Switch>
      <Route exact={true} path="/">
        <App />
      </Route>
      <Route exact={true} path="/edit">
        <App />
      </Route>
      <Route path="/deck/:deckData?">
        <Deck />
      </Route>
      <Route render={() => <Redirect to="/" />} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<AppWithRouter />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
