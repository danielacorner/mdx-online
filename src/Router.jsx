import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Deck from "./components/Deck";
import App from "./App";

import React from "react";
import Layout from "./components/Layout";
const AppWithRouter = () => (
  <BrowserRouter>
    <Switch>
      <Route exact={true} path="/" component={App} />
      <Route path="/deck/">
        <Layout isPresentationPage={true} pathToDeck={null}>
          <Deck />
        </Layout>
      </Route>
      <Route render={() => <Redirect to="/" />} />
    </Switch>
  </BrowserRouter>
);

export default AppWithRouter;
