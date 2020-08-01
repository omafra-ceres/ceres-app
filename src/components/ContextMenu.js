////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
//////                                                    //////
//////    This component should only be used in App.js    //////
//////    All other files should use useMenu to update    //////
//////                                                    //////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"

import useContextMenu from "../customHooks/useContextMenu"

const menuWidth = 150
const menuItemHeight = 30

const HeaderActionsMenu = styled.ul.attrs(p => {
  const [x, y] = (p.position || [0, 0])
  return {
    style: {
      display: p.isOpen ? "block" : "none",
      left: x,
      top: y,
      width: menuWidth
    }
  }
})`
  background: white;
  border-radius: 1px;
  box-shadow: 0 2px 6px 2px #3c404326;
  list-style: none;
  margin: 0;
  padding: 5px 0;
  position: absolute;
  top: 5px;
  z-index: 2;
`

const ActionMenuItem = styled.button.attrs(() => ({
  onMouseOver: e => e.target.focus(),
  height: menuItemHeight
}))`
  background: white;
  border: none;
  display: block;
  line-height: 30px;
  padding: 0 10px;
  text-align: left;
  width: 100%;

  &:focus {
    background: #BBDFFF;
    outline: none;
  }
`

const defaultState = {
  isOpen: false,
  position: [0, 0],
  actions: []
}

const MenuActionItem = ({ option }) =>(
  <li>
    <ActionMenuItem
      disabled={ option.disabled }
      onClick={ option.action }
    >
      { option.label }
    </ActionMenuItem>
  </li>
)

const ContextMenu = () => {
  const [ menuState, setMenuState ] = useState(defaultState)
  const menus = useContextMenu()
  const menuContainer = useRef()

  const closeMenu = () => {
    setMenuState({ isOpen: false })
  }

  useEffect(() => {
    const handleEvent = e => {
      const { target: { dataset }, clientX: x, clientY: y } = e
      const { contextmenu: menu, contextdata: data } = dataset

      if (menu) {
        e.preventDefault()
        const { options, onOpen } = menus[menu]

        const opAction = (op) => () => { closeMenu(); op.action(data) }
        const opDisabled = (op) => op.disabled && op.disabled(data)
        const ops = options.map(op => ({ ...op, action: opAction(op), disabled: opDisabled(op) }))
        
        const { innerWidth: width, innerHeight: height } = window
        const minX = width - menuWidth
        const minY = height - (menuItemHeight * options.length + 20)
        const position = [
          x > minX ? x - menuWidth : x,
          y > minY ? minY : y
        ]

        if (onOpen) onOpen(data)
        
        setMenuState({
          isOpen: true,
          options: ops,
          position
        })
      }
    }
    document.addEventListener("contextmenu", handleEvent)
    return () => document.removeEventListener("contextmenu", handleEvent)
  }, [ menus ])

  useEffect(() => {
    if (menuState.isOpen) {
      menuContainer.current.firstChild.firstChild.focus()
    }
  }, [ menuState ])

  const handleMenuBlur = e => {
    if (!e.relatedTarget) closeMenu()
  }

  const handleMenuKeyDown = e => {
    if (e.key === "Escape") closeMenu()
    
    if (!["Tab", "ArrowDown", "ArrowUp"].includes(e.key)) return

    const children = Array.from(e.currentTarget.children)
      .map(ch => ch.firstChild)
      .filter(ch => !ch.attributes.disabled)
    const first = children[0]
    const last = children[children.length - 1]
    
    // trap focus inside menu while menu is open
    if (e.key === "Tab") {
      if (e.target === first && e.shiftKey) {
        e.preventDefault()
        last.focus()
      }
      if (e.target === last && !e.shiftKey) {
        e.preventDefault()
        first.focus()
      }
    }

    // allow arrow keys to navigate menu
    if (e.key === "ArrowDown") {
      if (e.target === last) {
        first.focus()
      } else {
        children[children.indexOf(e.target) + 1].focus()
      }
    }
    if (e.key === "ArrowUp") {
      if (e.target === first) {
        last.focus()
      } else {
        children[children.indexOf(e.target) - 1].focus()
      }
    }
  }

  return (
    <HeaderActionsMenu
      {...menuState}
      ref={ menuContainer }
      onKeyDown={ handleMenuKeyDown }
      onBlur={ handleMenuBlur }
    >
      { (menuState.options || []).map((op, i) => (
        <MenuActionItem key={ i } option={ op } close={ closeMenu } />
      )) }
    </HeaderActionsMenu>
  )
}

export default ContextMenu