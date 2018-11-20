import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import awsconfig from "./aws-exports";
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";
import './App.css';
import Styles from './Components/Styles';
import StylesColours from './Components/StylesColours';
import StyleColour from './Components/StyleColour';
import Roll from './Components/Roll';
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css';


const cfg = {
  url: awsconfig.aws_appsync_graphqlEndpoint,
  region: awsconfig.aws_appsync_region,
  auth: {
    type: awsconfig.aws_appsync_authenticationType,
    // apiKey: appSyncConfig.aws_appsync_apiKey
    jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken()
  }
}

Amplify.configure(awsconfig);

const WebApp = () => (
  <Router>
    <App>
      <Route exact={true} path="/" component={StylesColours} />
      <Route path="/styles" component={Styles} />
      <Route path="/stylescolours" component={StylesColours} />
      <Route path="/stylecolour/:id" component={StyleColour} />
      <Route path="/roll/:id" component={Roll} />
    </App>
  </Router>
);

const WebAppWithAuth = withAuthenticator(WebApp, true);

const client = new AWSAppSyncClient(cfg);

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <WebAppWithAuth />
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;
