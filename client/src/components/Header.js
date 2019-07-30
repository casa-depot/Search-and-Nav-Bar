import React from 'react';
import TopNavBar from './TopNavBar.js';
import Cart from './Cart.js'
import Login from './Login.js'

const Header = (props) => {
  const inputStyle = {
    position: 'relative',
    width: "40%",
    height: '35px',
    border: '1px solid black'
  }
  const imgStyle = {
    position: 'relative',
    display: 'inline',
    width: '36px',
    height: '35px',
    top: '-2px'
  }
  const listStyle = {
    position: 'absolute',
    left: '0px',
    top: '35px',
    width: '100%',
    'backgroundColor': 'white',
    'opacity': 1,
    'maxHeight': '400px',
    'overflowY': 'scroll',
    'zIndex': 99
  }
  const headerStyle = {
    position: 'relative',
    top: '-15px',
    display: 'inline'
  }

  return (
    <div>
      <div className = "row">
        <TopNavBar />
      </div>
      <div style={headerStyle} className = "container-fluid row">
          <img className = 'homedepotIcon' onClick = {props.homepageClick} src="https://home-de-potts.s3.us-east-2.amazonaws.com/home-depot-logo.png" height = "100px" width = "100px"/>
          <img className = 'd-none d-md-inline' src="https://home-de-potts.s3.us-east-2.amazonaws.com/location.png" height = "59px" width = "158px" />
          <div style={{display: 'inline'}}>
            <div className = 'container-fluid' style={{display: 'inline'}}>
              <span style={{position: 'relative', display: 'inline'}} className = "input-group mb-3">
                <input style = {inputStyle} type = "text" placeholder = "What can we help you find today?"
                  onBlur = {() => setTimeout(props.loseFocusSearch, 150)}
                  onChange = {props.handleInputChange}/>
                {props.showSuggest === true ? (
                  <div style = {listStyle} className = "suggestMichael border border-dark">
                    {props.suggestList.map((item) => 
                      <div key = {item.id} className = "listclickMichael dropdown-item" onClick = {props.renderNewItem}>
                        <span id = {item.id}>{item.name} </span>
                        {/* <img className = 'd-none d-md-inline' style = {{position: 'relative', float: 'right', top: '-4px'}}height = '33px' src={`https://home-de-potts.s3.us-east-2.amazonaws.com/items/${item.id}-0.jpg`} /> */}
                      </div>)}
                  </div>
                ) : (<></>)}
                <img className="input-group-addon img-fluid p-0 m-0" style = {imgStyle} onClick = {props.renderNewItem} 
                  src="https://home-de-potts.s3.us-east-2.amazonaws.com/button.png" />
              </span>
            </div>
              
            </div>
          <span style = {{padding: '30px'}}></span>
          <Login login = {props.login}
                  userLogout = {props.userLogout}
                  showLogin = {props.showLogin}
                  userLogin = {props.userLogin}/>
          <span style = {{padding: '30px'}}></span>
          <Cart cart = {props.cart} itemHoverd = {props.itemHovered} 
                cartClick = {props.cartClick}
                deleteCartItem = {props.deleteCartItem}
                loseFocusCart = {props.loseFocusCart}
                handleCheckout = {props.handleCheckout}/>
       </div>
    </div>
  );
}
 
export default Header;