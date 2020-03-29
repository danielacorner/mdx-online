import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Deck from "./components/Deck";
import App from "./App";
import { CastProvider } from "react-cast-sender";

import React from "react";
const AppWithRouter = () => (
  // https://antewall.github.io/react-cast-sender/
  <CastProvider receiverApplicationId="CC1AD845">
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
  </CastProvider>
);
export default AppWithRouter;
