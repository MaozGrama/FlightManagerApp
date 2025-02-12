import React, { useState } from 'react'

export const ToolTip = ( {text, children} ) => {
  const [isVisible, setIsVisible] = useState(false)
  return (
    <div className="tooltip-container" 
    onMouseEnter = {()=> setIsVisible(true)}
    onMouseLeave = {()=> setIsVisible(false)}>
      {children}
      {isVisible && <div id='tooltipcontent' className="tooltip">{text}</div>}
        </div>
  )
}



