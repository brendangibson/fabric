import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
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
import Summary from "./Components/Summary";
import Roll from "./Components/Roll";
import Shipments from "./Components/Shipments";
import Status from "./Components/Status";
import Stock from "./Components/Stock";
import Holds from "./Components/Holds";
import AllHolds from "./Components/AllHolds";

import Timeline from "./Components/Timeline";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

Amplify.configure(awsconfig);

export const TradeContext = React.createContext(true);
export const UsernameContext = React.createContext();

const WebApp = ({ authState, ...other }) => {
  const [isTrade, setIsTrade] = useState(false);
  const [username, setUsername] = useState();

  useEffect(() => {
    Auth.currentSession()
      .then((a) => {
        const decoded = a.getAccessToken().decodePayload();

        setIsTrade(
          Boolean(
            decoded &&
              decoded["cognito:groups"] &&
              decoded["cognito:groups"].includes("trade")
          )
        );
        setUsername(decoded.username);
      })
      .catch((e) => {
        setIsTrade(false);
        setUsername(undefined);
      });
  }, [authState]);

  return authState !== "signedIn" ? null : (
    <Router>
      <TradeContext.Provider value={isTrade}>
        <UsernameContext.Provider value={username}>
          <App>
            <Switch>
              <Route
                exact={true}
                path="/"
                component={isTrade ? Summary : StylesColours}
              />
              {!isTrade && <Route path="/styles" component={Styles} />}
              {!isTrade && (
                <Route path="/stylescolours" component={StylesColours} />
              )}
              {!isTrade && (
                <Route path="/stylecolour/:id" component={StyleColour} exact />
              )}
              <Route path="/summary" component={Summary} />
              {isTrade ? (
                <Route path="/holds" component={Holds} />
              ) : (
                <Route path="/holds" component={AllHolds} />
              )}

              {!isTrade && <Route path="/roll/:id" component={Roll} />}
              {!isTrade && <Route path="/shipments" component={Shipments} />}
              {!isTrade && <Route path="/stock" component={Stock} />}
              {!isTrade && <Route path="/status" component={Status} exact />}
              {!isTrade && (
                <Route path="/report/timeline" component={Timeline} exact />
              )}
              <Route
                path="*"
                exact
                component={isTrade ? Summary : StylesColours}
              />
            </Switch>
          </App>
        </UsernameContext.Provider>
      </TradeContext.Provider>
    </Router>
  );
};

// const WebAppWithAuth = withAuthenticator(WebApp, false);

const defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

const cfg = {
  url: awsconfig.aws_appsync_graphqlEndpoint,
  region: awsconfig.aws_appsync_region,
  auth: {
    type: awsconfig.aws_appsync_authenticationType,
    apiKey: awsconfig.aws_appsync_apiKey,
    jwtToken: async () =>
      (await Auth.currentSession()).getAccessToken().getJwtToken(),
  },
  defaultOptions: defaultOptions,
};

const SienAndCoTheme = {
  sectionHeader: {
    width: "calc(100vw - 50px)",
  },
  sectionFooter: {
    width: "calc(100vw - 50px)",
  },
  sectionBody: {
    width: "calc(100vw - 50px)",
  },
  toast: {
    top: "50%",
  },
  button: {
    backgroundColor: "#23272b",
    borderColor: "#1d2124",
  },
  navBar: {
    display: "none",
  },
};

const client = new AWSAppSyncClient(cfg);

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <Authenticator theme={SienAndCoTheme}>
        <WebApp />
      </Authenticator>
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;
