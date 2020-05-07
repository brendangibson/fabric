import React, { Component } from "react";
import { Query } from "react-apollo";

import QueryGetStyleColour from "../../GraphQL/QueryGetStyleColour";

import Loading from "../Loading";


const renderCut = cut => <p>{cut.timestamp},{cut.length},{cut.reason}</p>


class StyleColour extends Component {
  
  render() {
    const { match } = this.props;

    return (
      <Query
        query={QueryGetStyleColour}
        variables={{ id: match.params.id }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return `Error! ${error.message}`;


          const styleColourPage = data.styleColourPage;
          if (!styleColourPage) return null;

          const allCuts = styleColourPage.rolls.map(
            roll => roll.cuts.map(cut => cut)).flat().sort((a,b) => a.timestamp - b.timestamp
          )

          console.log('rolls: ', styleColourPage.rolls)
          console.log('allCuts: ', allCuts)

          return (<code>
            {allCuts.map(renderCut)}
            </code>
          );
        }}
      </Query>
    );
  }
}

export default StyleColour;
