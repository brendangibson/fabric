import React from 'react'



const getHeight = (length) => {
    return 20 * (length/30)
}

const wrapperStyle = {
    padding: "5vw 10vw"
}

const dataStyle = {
    display: "inline-block"
}

const labelStyle ={
    backgroundColor: "#fff",
    color: "#000",
    border: "1px dashed black",
    display: "inline-block",
    padding: "1vw",
    position: "absolute",
    transform: "translate(-50%, -50%)",
    top: "50%",
    left: "50%"
}

const RollIcon = (props) => (
    <div style={wrapperStyle}>
        <div style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.26) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0.32) 100%), url('+props.swatchUrl+')',
            display: "inline-block",
            textAlign: "center",
            backgroundRepeat: "repeat",
            backgroundSize: "5vw",
            width: "calc(70% + " + getHeight(props.originalLength)/2 + "vw)",
            height: getHeight(props.originalLength) + 'vw',
            position: "relative"
        }}>
            <div style={{
                borderRadius: "50%",
                background: "#8E6033",
                transform: "translateX(-" + (getHeight(props.originalLength))/4 + "vw)",
                width: getHeight(props.originalLength)/2 + 'vw',
                position: "absolute",
                height: getHeight(props.originalLength) + 'vw',
                left: 0
            }}><div style={{
                position: "absolute",
                background: "#333",
                transform: "translateX(-50%) translateY(-50%)",
                top: "50%",
                left: "50%",
                borderRadius: "50%",
                height: "10px",
                width: "5px"
            }}/></div>
            <div style={labelStyle}>{props.glenRavenId}</div>
            <div style={{
                overflow: "hidden",
                right: 0,
                top: 0,
                position: "absolute",
                width: getHeight(props.originalLength)/2 + 'vw',
                height: getHeight(props.originalLength) + 'vw'
            }}>
                <div style={{
                    borderRadius: "50%",
                    background: "transparent",
                    transform: "translateX(-" + (getHeight(props.originalLength)/4) + "vw)",
                    width: getHeight(props.originalLength)/2 + 'vw',
                    position: "absolute",
                    height: getHeight(props.originalLength) + 'vw',
                    boxShadow: "0 0 0 20vw white" 
                }}/>
            </div>
        </div>
        <div style={dataStyle}>{props.originalLength} yards</div>
    </div>
)

export default RollIcon