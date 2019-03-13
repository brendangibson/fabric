import React from 'react'

const height = 100

const wrapperStyle = {
  position: 'relative',
  width: '100%'
}

const leftEndStyle = {
  position: 'absolute',
  borderRadius: '50%',
  border: '1px dashed black',
  height: height,
  width: height / 2,
  transform: 'translateX(-50%)',
  left: 0,
  zIndex: 1
}

const coreStyle = {
  background: 'black',
  borderRadius: '50%',
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  left: '50%',
  top: '50%',
  height: height / 5,
  width: height / 10,
  zIndex: 2
}

const bodyStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  borderTop: '1px dashed black',
  borderBottom: '1px dashed black',
  background: 'white',
  height: height
}

const rightEndStyle = {
  position: 'absolute',
  borderRadius: '50%',
  border: '1px dashed black',
  height: height,
  width: height / 2,
  transform: 'translateX(50%)',
  right: 0,
  zIndex: -1
}

const diameterStyle = {
  position: 'absolute',
  top: '50%',
  left: height/3,
  transform: `translateY(-50%)`,
}

const lengthStyle  = {
  position: 'absolute',
  left: '50%',
  top: '105%',
  transform: 'translateX(-50%)'
}

const weightStyle = {
  position: 'absolute',
  left: '70%',
  top: '50%',
  transform: 'translateY(-50%)',
  fontWeight: 'bold'
}

const vertArrows = {
  color: 'red'
}

const horizArrows = {
  color: 'red'
}

export default function DimensionIcon (props) {
  
  const {diameter, weight, length} = props

  return (
    <div style={wrapperStyle}>
      <div style={leftEndStyle}>
        <div style={coreStyle}></div>
      </div>
      <div style={bodyStyle}>
        
        <div style={diameterStyle}><span style={vertArrows}>↕ </span>{diameter && diameter.toFixed(1)} in</div>
        <div style={weightStyle}>{weight && weight.toFixed(1)} lbs</div>
        
        <div style={lengthStyle}>{length && length} in <span style={horizArrows}>↔</span></div>
      </div>
      <div style={rightEndStyle}></div>
    </div>
  )
}