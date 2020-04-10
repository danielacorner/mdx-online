import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Deck from "./components/Deck";
import App from "./App";

import React from "react";
const AppWithRouter = () => (
  <BrowserRouter>
    <Switch>
      <Route exact={true} path="/">
        <App />
      </Route>
      <Route path="/deck/:deckData?">
        <Deck />
      </Route>
      <Route render={() => <Redirect to="/" />} />
    </Switch>
  </BrowserRouter>
);
export default AppWithRouter;
