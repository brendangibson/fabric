import React, {Fragment, useState, useEffect} from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Amplify, { Auth } from "aws-amplify";
import { Authenticator } from "aws-amplify-react";

import awsconfig from "./aws-exports";
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient from "aws-appsync";

import { Rehydrated } from "aws-appsync-react";
import "./App.css";
import Styles from "./Components/Styles";
import StylesColours from "./Components/StylesColours";
import StyleColour from "./Components/StyleColour";
import Roll from "./Components/Roll";
import Shipments from './Components/Shipments';
import Standings from './Components/Standings';
import CSVStandings from './Components/CSV/Standings';
import CSVStyleColour from './Components/CSV/StyleColour';
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

Amplify.configure(awsconfig);

const WebApp = ({authState, ...other}) => {
  const [isTrade, setIsTrade] = useState(false)

  console.log('WebApp authData: ', other)

  useEffect(()=>{
    Auth.currentSession().then(a=>{
      const decoded = a.getAccessToken().decodePayload()
      console.log('cfg.auth: ', decoded)
      setIsTrade(decoded && decoded['cognito:groups'] && decoded['cognito:groups'].includes('trade'))
    })
  },[authState])

console.log('isTrade: ', isTrade)
  return authState !== "signedIn" ? null : (
    <Router>
        

      <App>
        {isTrade? <p>Hello Trader</p> :
        <Fragment>
          <Route exact={true} path="/" component={StylesColours} />
          <Route path="/styles" component={Styles} />
          <Route path="/stylescolours" component={StylesColours} />
          <Route path="/stylecolour/:id" component={StyleColour} exact/>
          <Route path="/roll/:id" component={Roll} />
          <Route path="/shipments" component={Shipments} />
          <Route path="/report/csv" component={CSVStandings} exact/>
          <Route path="/stylecolour/:id/csv" component={CSVStyleColour} exact/>
        
        <Route path="/report" component={Standings} exact/>
        </Fragment>
        }
      </App>
    </Router>
  );
};

// const WebAppWithAuth = withAuthenticator(WebApp, false);

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

const cfg = {
  url: awsconfig.aws_appsync_graphqlEndpoint,
  region: awsconfig.aws_appsync_region,
  auth: {
    type: awsconfig.aws_appsync_authenticationType,
    apiKey: awsconfig.aws_appsync_apiKey,
    jwtToken: async () =>
      (await Auth.currentSession()).getAccessToken().getJwtToken()
  },
  defaultOptions: defaultOptions
};


const SienAndCoTheme = {
  sectionHeader: {
    width: "calc(100vw - 50px)"
  },
  sectionFooter: {
    width: "calc(100vw - 50px)"
  },
  sectionBody: {
    width: "calc(100vw - 50px)"
  },
  toast: {
    top: "50%"
  },
  button: {
    backgroundColor: "#23272b",
    borderColor: "#1d2124"
  },
  navBar: {
    display: 'none'
  }
};

const client = new AWSAppSyncClient(cfg);

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <Authenticator theme={SienAndCoTheme}>
        <WebApp/>
      </Authenticator>
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;
