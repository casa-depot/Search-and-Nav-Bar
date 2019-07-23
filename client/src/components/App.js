import React, { Component } from 'react';
import NavBar from './NavBar.js';
import Header from './Header.js';
import axios from 'axios'

export default class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			searchSite: '',
			itemList: [],
			dropDownImage: {category: '', images: []},
			itemHovered: false,
			inputValue: '',
			suggestList: [],
			showSuggest: false,
			cart: {
				cartList: [],
				cartClicked: false,
				numberOfItems: 0,
				totalPrice: 0
			},
			login: {
				name: '',
				previouslyViewed: [],
				showLoginScreen: false,
				error: ''
			}
		}
	}

	componentDidMount() {
		this.appendScript("https://code.jquery.com/jquery-3.3.1.slim.min.js");
		this.appendScript("https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js");
		this.appendScript("ttps://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js");
		window.addEventListener('updatePath', (e) => {
			let newLogin = this.state.login;
			let addNewView = true;
			for (let i = 0; i < newLogin.previouslyViewed.length; i++){
				if (newLogin.previouslyViewed[i] === e.detail.id){
					addNewView = false
					break;
				}
			}
			if (addNewView){
				newLogin.previouslyViewed.push(e.detail.id)
				this.setState({login: newLogin});
				axios.post(`${this.state.searchSite}/previousViews`, {username: this.state.login.name, id: e.detail.id}, {withCredentials: true})
				.then(() => console.log('completed'))}
		})

		window.addEventListener('addToCart', (e) => {
			let newItem = true;
			if (!e.detail.quantity) {
				e.detail.quantity = 1;
			}
			let newCart = this.state.cart;
			let tempCart = {}
			for (let i = 0; i < this.state.itemList.length; i++){
				if (parseInt(this.state.itemList[i].id) == e.detail.id){
					tempCart.name = this.state.itemList[i].name;
					tempCart.id = parseInt(e.detail.id);
					tempCart.quantity = e.detail.quantity;
					tempCart.price = this.state.itemList[i].price;
					tempCart.username = this.state.login.name;
					newCart.numberOfItems+= e.detail.quantity;
					for (let j = 0; j < newCart.cartList.length; j++){
						if (newCart.cartList[j].id == e.detail.id){
							newCart.cartList[j].quantity += e.detail.quantity;
							newItem = false;
							break;
						}
					}
					if (newItem){
						newCart.totalPrice += (this.state.itemList[i].price * e.detail.quantity);
						newCart.cartList.push({id: this.state.itemList[i].id, name: this.state.itemList[i].name, price: this.state.itemList[i].price, quantity: e.detail.quantity});
						break;
					}
				}
			}
			this.setState({cart: newCart});
			axios.post(`${this.state.searchSite}/addToCart`, {tempCart}, {withCredentials: true})
			.then(()=> {console.log('success')})
		})
		axios.get(`${this.state.searchSite}/allItems`, {params: {name: this.state.login.name}, withCredentials: true})
		.then((results) => {
			let itemList = [];
			results.data.data.map(item => {
				if (item.name.length > 40){
					itemList.push({name: item.name.substring(0, 40) + "...", id: item.id, price: item.price, category: item.category});
				} else {
				itemList.push({name: item.name, id: item.id, price: item.price, category: item.category})}
			});
			this.setState({itemList: itemList});
			if (results.data.cart){
				let newCart = this.state.cart;
				results.data.cart.map((item => {
					newCart.numberOfItems += item.quantity;
					newCart.cartList.push({id: item.id, price: item.price, name: item.name, quantity: item.quantity})
					newCart.totalPrice += item.price;
				}))
				this.setState({cart: newCart});
			}
			if (results.data.login.name !== ''){
				this.setState({login: results.data.login})
			}
		})
	}
	
	appendScript(url) {
		const script = document.createElement('script');
		script.src = url;
		script.async = true;
		document.body.appendChild(script);
	}

	handleShadeIn(e) {
		this.setState({itemHovered: true})
	}
	handleShadeOut(e) {
		this.setState({itemHovered: false})
	}

	handleInputChange(e) {
		if (e.target.value === ''){
		 this.setState({showSuggest: false})
		} else {
		let currentList = [];
		let {itemList} = this.state;
		for (let i = 0; i < itemList.length; i++){
			if (itemList[i].name.toLowerCase().includes(e.target.value.toLowerCase())){
				currentList.push(itemList[i]);
			}
		}
		this.setState({inputValue: e.target.value, suggestList: currentList, showSuggest: true});
	}
	}

	loseFocusSearch(){
		this.setState({showSuggest: false})
	}

	loseFocusCart(){
		let newCart = this.state.cart;
		newCart.cartClicked = false;
		this.setState({itemHovered: false, cart: newCart})
	}

	handleNewItem() {
		//set window to new item
		this.setState({inputValue: ''});
	}

	renderNewItem(e) {
		window.dispatchEvent(
			new CustomEvent('updatePath', {
				detail: {id: e.target.id},
			})
		)
		this.setState({showSuggest: false})
	}

	imageClick(id) {
		window.dispatchEvent(
			new CustomEvent('updatePath', {
				detail: {id: id},
			})
		)
		let newDropDown = {category: '', images: []}
		this.setState({itemHovered: false, dropDownImage: newDropDown})
	}

	deleteCartItem(index) {
		let newCart = this.state.cart;
		newCart.numberOfItems--;
		newCart.totalPrice -= newCart.cartList[index].price;
		axios.post(`${this.state.searchSite}/deleteFromCart`, {item:newCart.cartList[index]}, {withCredentials: true})
		.then(() => {
			newCart.cartList.splice(index, 1);
			this.setState({cart: newCart});
		})
	}

	setDropImg(img) {
		let tempImage = {images: [], category: img};
		if (img !== ''){
			this.state.itemList.map((item) => {
				if (item.category === img){
					tempImage.images.push(item.id);
				}
			})
		}
		this.setState({dropDownImage: tempImage})
	}

	cartClick() {
		let newCart = this.state.cart;
		if (this.state.cart.cartClicked) {
			newCart.cartClicked = false;
			this.setState({itemHovered: false, cart: newCart});
		} else {
		newCart.cartClicked = true;
		this.setState({itemHovered: true, cart: newCart})
		}
	}

	handleCheckout() {
		axios.get(`${this.state.searchSite}/checkout`, {withCredentials: true})
		.then((res) => {console.log(res)
			let newCart = {
				cartList: [],
				cartClicked: false,
				numberOfItems: 0,
				totalPrice: 0
			}
			this.setState({itemHovered: false, cart: newCart})
		});
	}

	showLogin() {
		let login = this.state.login;
		let itemHovered = true;
		if (this.state.login.showLoginScreen === true){
			login.showLoginScreen = false;
			itemHovered = false;
		} else {
			login.showLoginScreen = true;
		}
		this.setState({login, itemHovered})
	}

	userLogin(username, password, type) {
		event.preventDefault()
		let newLogin = this.state.login;
		if (type === 'userLogin'){
			axios.get(`${this.state.searchSite}/userLogin`, {params: {username, password}, withCredentials: true})
			.then((res) => {
				if (res.data === 'Logged In') {
					newLogin.name = username;
					newLogin.showLoginScreen = false;
						axios.get(`${this.state.searchSite}/getUserViews`, {params: {username, password}, withCredentials: true})
						.then((response) => {
							for (let i = 0; i < response.data.length; i++){
								newLogin.previouslyViewed.push(response.data[i].id)
							}
							this.setState({login: newLogin, itemHovered: false })
							axios.get(`${this.state.searchSite}/getCart`, {params: {username}, withCredentials: true})
							.then((cartData) => {
								if (cartData.data.length){
									let newCart = this.state.cart;
									cartData.data.map((item => {
										newCart.numberOfItems += item.quantity;
										newCart.cartList.push({id: item.id, price: item.price, name: item.name, quantity: item.quantity})
										newCart.totalPrice += item.price;
									}))
									this.setState({cart: newCart});
								}
							})
						})
				} else if(res.data === 'username does not exist'){
					newLogin.error = res.data;
					this.setState({login: newLogin})
				}else if(res.data === 'Password incorrect'){
					newLogin.error = res.data;
					this.setState({login: newLogin})
				} else if(res.data === '4 character minimum for username and password'){
					newLogin.error = res.data;
					this.setState({login: newLogin})
				}
			});
		} else if (type === 'newAccount'){
			axios.post(`${this.state.searchSite}/newAccount`, {username, password}, {withCredentials: true})
			.then((res) => {
				if (res.data === 'Logged In') {
					newLogin.name = username;
					newLogin.showLoginScreen = false;
					this.setState({login: newLogin, itemHovered: false})
				} else if(res.data === 'username exists'){
					newLogin.error = res.data;
					this.setState({login: newLogin})
				}else if(res.data === '4 character minimum for username and password'){
					newLogin.error = res.data;
					this.setState({login: newLogin})
				}
			});
		}
	}

	userLogout() {
		let tempCart = {cartList: [],
			cartClicked: false,
			numberOfItems: 0,
			totalPrice: 0
		}
		let newLogin = this.state.login;
		newLogin.name = '';
		newLogin.showLoginScreen = false;
		this.setState({login: newLogin, itemHovered: false, cart: tempCart})
		axios.get(`${this.state.searchSite}/logout`, {withCredentials: true})
		.then(() => console.log('logged out'))
	}

	homepageClick() {
		window.location = '/';
	}
	
	render() {
		const shadeStyle = {
			position: 'absolute',
			height: '2000px',
			width: '100%',
			'backgroundColor': 'black',
			top: '205px',
			'zIndex': '99',
			opacity: '.3'
		}
		return (
			<>
				<Header inputValue = {this.state.inputValue}
								homepageClick = {this.homepageClick.bind(this)}
								userLogout = {this.userLogout.bind(this)}
								login = {this.state.login}
								showLogin = {this.showLogin.bind(this)}
								suggestList = {this.state.suggestList}
								itemList = {this.state.itemList}
								handleInputChange = {this.handleInputChange.bind(this)} 
								handleNewItem = {this.handleNewItem.bind(this)}
								renderNewItem = {this.renderNewItem.bind(this)}
								showSuggest = {this.state.showSuggest}
								itemHoverd = {this.state.itemHovered}
								cartClick = {this.cartClick.bind(this)}
								cart = {this.state.cart}
								userLogin = {this.userLogin.bind(this)}
								deleteCartItem = {this.deleteCartItem.bind(this)}
								loseFocusCart = {this.loseFocusCart.bind(this)}
								loseFocusSearch = {this.loseFocusSearch.bind(this)}
								handleCheckout = {this.handleCheckout.bind(this)}/>
				<NavBar imageClick = {this.imageClick.bind(this)}
								handleShadeIn = {this.handleShadeIn.bind(this)} 
								handleShadeOut = {this.handleShadeOut.bind(this)}
								dropDownImage = {this.state.dropDownImage}
								setDropImg = {this.setDropImg.bind(this)}
								/>
				{this.state.itemHovered === true ? (<div style = {shadeStyle}></div>) : (<></>)}
			</>
		)
	}
}