import React, { Component } from "react";

import { graphql, compose, withApollo } from "react-apollo";
import QueryGetStyles from "../GraphQL/QueryGetStyles";
import MutationCreateStyle from "../GraphQL/MutationCreateStyle";


class Styles extends Component {

    state = {
        style: {
            name: ''
        }
    }

    static defaultProps = {
        styles: [],
        createStyle: () => null,
    }

    handleSave = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { createStyle, history } = this.props;
        const { style } = this.state;

        await createStyle({ ...style });

        history.push('/');
    }

    handleChange(field, { target: { value } }) {
        const { style } = this.state;

        style[field] = value;

        this.setState({ style });
    }


    renderStyle = (style) => (
        <div key={style.id}>{style.name}</div>
    );

    render() {
        const { styles } = this.props;
        const {style} = this.state;

        return (
            <div>
                <div>
                    {styles.map(this.renderStyle)}
                </div>
                <input type="text" id="name" value={style.name} onChange={this.handleChange.bind(this, 'name')}/>
                <input type="text" id="weight" value={style.weight} onChange={this.handleChange.bind(this, 'weight')}/>
                <input type="text" id="thickness" value={style.thickness} onChange={this.handleChange.bind(this, 'thickness')}/>
                <input type="text" id="patternWidth" value={style.patternWidth} onChange={this.handleChange.bind(this, 'patternWidth')}/>
                <input type="text" id="patternHeight" value={style.patternHeight} onChange={this.handleChange.bind(this, 'patternHeight')}/>

                <button onClick={this.handleSave}>Add</button>
            </div>
        );
    }

}

export default withApollo(compose(
    graphql(
        QueryGetStyles,
        {
            fetchPolicy: 'network-only',
            props: ({ data: { getStyles = [] } }) => ({
                styles: getStyles
            })
        }
    ),
    graphql(
        MutationCreateStyle,
    {
        props: (props) => ({
            createStyle: (style) => {
                return props.mutate({
                    update: (proxy, { data: { createStyle } }) => {
                        const query = QueryGetStyles;
                        const data = proxy.readQuery({ query });

                        // data.getStyles.items = [...data.listEvents.items.filter(e => e.id !== createEvent.id), createEvent];

                        proxy.writeQuery({ query, data });
                    },
                    variables: style,
                    refetchQueries: [QueryGetStyles]
                })
            }
        })
    }
    )
)(Styles));
