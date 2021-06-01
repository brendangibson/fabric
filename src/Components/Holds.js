import React, { useContext } from "react";

import { Query } from "react-apollo";
import QueryGetHoldsByOwner from "../GraphQL/QueryGetHoldsByOwner";
import Loading from "./Loading";
import Hold from "./Hold";
import { UsernameContext } from "../WebApp";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "5vw 0",
};

const Holds = () => {
  const username = useContext(UsernameContext);

  return (
    <div style={wrapperStyle}>
      <h1>My Reserves</h1>
      <Query
        query={QueryGetHoldsByOwner}
        fetchPolicy="network-only"
        variables={{
          owner: username,
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <Loading />;

          if (error) return `Error! ${error.message}`;

          return (
            <div>
              {data.getHoldsByOwner.length === 0
                ? "No fabric currently reserved"
                : data.getHoldsByOwner.map((hold) => (
                    <Hold
                      hold={hold}
                      key={hold.id}
                      refetchQueries={[
                        {
                          query: QueryGetHoldsByOwner,
                          variables: {
                            owner: username,
                          },
                        },
                      ]}
                    />
                  ))}
            </div>
          );
        }}
      </Query>
    </div>
  );
};

export default Holds;
