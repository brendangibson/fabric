import React from "react";

import { Query } from "react-apollo";
import QueryGetHolds from "../GraphQL/QueryGetHolds";
import Loading from "./Loading";
import Hold from "./Hold";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "5vw 0",
};

const AllHolds = () => {
  return (
    <div style={wrapperStyle}>
      <h1>All Reserves</h1>
      <Query query={QueryGetHolds} fetchPolicy="network-only">
        {({ loading, error, data }) => {
          if (loading) return <Loading />;

          if (error) return `Error! ${error.message}`;

          return (
            <div>
              {data.getHolds.length === 0
                ? "No fabric currently reserved"
                : null}
              <h3>Pending</h3>
              {data.getHolds
                .filter((hold) => hold.pending)
                .map((hold) => (
                  <Hold
                    hold={hold}
                    key={hold.id}
                    refetchQueries={[
                      {
                        query: QueryGetHolds,
                      },
                    ]}
                  />
                ))}
              <h3>Approved</h3>

              {data.getHolds
                .filter((hold) => !hold.pending)
                .map((hold) => (
                  <Hold
                    hold={hold}
                    key={hold.id}
                    refetchQueries={[
                      {
                        query: QueryGetHolds,
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

export default AllHolds;
