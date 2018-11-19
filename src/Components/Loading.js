import React from 'react'


const imgStyle = {
    width: "100vw",
    animation: `pulse 2s infinite`,
    display: "block"
}

const Loading = () => (
    <img src="/bigLogo.png" alt="Loading..." style={imgStyle}/>
)

export default Loading