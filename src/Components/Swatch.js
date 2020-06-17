import React from 'react'



const Swatch = (props) => {

    const swatchStyle = {
        backgroundImage: 'url(' + props.src + ')',
        boxShadow: "inset 0px 0px 5px rgba(0,0,0,0.5)",
        width: "100%",
        paddingBottom: "100%",
        backgroundSize: "contain"
    }

    return <div style={swatchStyle} />
} 

export default Swatch