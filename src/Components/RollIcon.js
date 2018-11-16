import React from 'react'



const getHeight = (length) => {
    return 10 * (length/30)
}

const wrapperStyle = {
    height: "20vw",
    padding: "5vw"
}

const dataStyle = {
    display: "inline-block"
}

const labelStyle ={
    backgroundColor: "#fff",
    color: "#000"
}

const RollIcon = (props) => (
    <div style={wrapperStyle}>
        <div style={{
            backgroundImage: 'url('+props.swatchUrl+'), linear-gradient(to bottom, #4c4c4c 0%,#595959 12%,#666666 25%,#474747 39%,#2c2c2c 50%,#000000 51%,#111111 60%,#2b2b2b 76%,#1c1c1c 91%,#131313 100%)',
            display: "inline-block",
            textAlign: "center",
            backgroundRepeat: "repeat-x",
            backgroundSize: "contain",
            width: "70%",
            height: getHeight(props.originalLength) + 'vw',
            position: "relative"
        }}>
            <div style={{
                borderRadius: "50%",
                backgroundColour: "#F5F5DC",
                transform: "translateX(-" + (getHeight(props.originalLength)/2) + "vw)",
                width: getHeight(props.originalLength)/2 + 'vw',
                position: "absolute",
                height: getHeight(props.originalLength) + 'vw',
                left: 0
            }}><div style={{
                position: "absolute",
                colour: "#333",
                transform: "translateX(-50%) translateY(-50%)",
                top: "50%",
                left: "50%",
                borderRadius: "50%",
                height: "10px",
                width: "10px"
            }}/></div>
            <div style={labelStyle}>{props.glenRavenId}</div>
            <div style={{
                borderRadius: "50%",
                backgroundColour: "transparent",
                boxShadow: "20000px white",
                transform: "translateX(-" + (getHeight(props.originalLength)/2) + "vw)",
                width: getHeight(props.originalLength)/2 + 'vw',
                position: "absolute",
                height: getHeight(props.originalLength) + 'vw',
                right: 0
            }}/>
        </div>
        <div style={dataStyle}>{props.originalLength} yards</div>
    </div>
)

export default RollIcon