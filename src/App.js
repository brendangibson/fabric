import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import "semantic-ui-css/semantic.min.css";
import 'react-datepicker/dist/react-datepicker.css';

import appSyncConfig from "./aws-exports";
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";
import './App.css';
import NewEvent from './Components/NewEvent';
import ViewEvent from './Components/ViewEvent';
import Colours from './Components/Colours';
import Styles from './Components/Styles';
import StylesColours from './Components/StylesColours';
import StyleColour from './Components/StyleColour';
import Roll from './Components/Roll';

const App = () => (
  <Router>
    <div>
      <Route exact={true} path="/" component={Colours} />
      <Route path="/styles" component={Styles} />
      <Route path="/stylescolours" component={StylesColours} />
      <Route path="/stylecolour/:id" component={StyleColour} />
      <Route path="/roll/:id" component={Roll} />

      <Route path="/event/:id" component={ViewEvent} />
      <Route path="/newEvent" component={NewEvent} />
    </div>
  </Router>
);

const client = new AWSAppSyncClient({
  url: appSyncConfig.aws_appsync_graphqlEndpoint,
  region: appSyncConfig.aws_appsync_region,
  auth: {
    type: appSyncConfig.aws_appsync_authenticationType,
    apiKey: appSyncConfig.aws_appsync_apiKey
  
  }
});

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;
