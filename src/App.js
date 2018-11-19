import React from 'react'

import Header from './Components/Header'

const wrapperStyle = {
    padding: "0 5vw 5vw 5vw"
}

const App = (props) => (
    <div style={wrapperStyle} className="fabricApp">
        <Header />
        {props.children}
    </div>
)

export default App