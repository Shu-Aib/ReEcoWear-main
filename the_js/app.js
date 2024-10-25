let iconCart = document.querySelector('.icon-cart');
let closeCart = document.querySelector('.close');
let body = document.querySelector('.men-products') || document.querySelector('.women-products'); // Generic for both men and women
let listCartHTML = document.querySelector('.listCart');
let iconCartSpan = document.querySelector('.icon-cart span');

// This is already present, I'll make it generic for both men and women
let listProductHTML = document.querySelector('.men-shop') || document.querySelector('.women-shop'); 

let listProducts = [];
let carts = [];
let currentPage = ''; // Track current page (men or women)

// Cart toggle functionality
iconCart.addEventListener('click', () => {
    body.classList.toggle(`${currentPage}-products`); // Toggles the display of cart based on current page
});

closeCart.addEventListener('click', () => {
    body.classList.toggle(`${currentPage}-products`); // Closes the cart display
});

// Function to add product data to HTML
const addDataToHTML = () => {
  listProductHTML.innerHTML = '';
  if (listProducts.length > 0) {
      listProducts.forEach(product => {
        let newProduct = document.createElement('div');
        newProduct.classList.add('m-item');
        newProduct.dataset.id = product.id;
        newProduct.innerHTML = `
        <div class="m-pic">
          <img class="m-preview" src="${product.image}">
        </div>

        <div class="desc">
          <p class="clothing-item">${product.name}</p>
          <p class="${currentPage}-price">R${product.price}</p>
          <button class="cartButton">Add to Cart</button>
        </div>`;
        listProductHTML.appendChild(newProduct);
    });
  }
};

// Add click event listener for "Add to Cart"
listProductHTML.addEventListener('click', (event) => {
  let positionClick = event.target;
  if (positionClick.classList.contains('cartButton')) {
    let productElement = positionClick.closest('.m-item');  // Get closest div with class 'm-item'
    let product_id = productElement.dataset.id;  // Fetch product_id from data attribute

    if (product_id) {
      cartButton(product_id);  // Pass product_id to cartButton function
    } else {
      console.error("Product ID not found in dataset");
    }
  }
});

// Function to handle adding product to cart
const cartButton = (product_id) => {
  let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
  if (carts.length <= 0) {
    carts = [{
      product_id: product_id,
      quantity: 1
    }]
  }
  else if (positionThisProductInCart < 0) {
    carts.push({
      product_id: product_id,
      quantity: 1
    });
  }
  else {
    carts[positionThisProductInCart].quantity += 1;
  }
  addCartToHTML();
  addCartToMemory();
}

// Save cart to localStorage
const addCartToMemory = () => {
  localStorage.setItem(`${currentPage}_cart`, JSON.stringify(carts)); // Store based on men/women page
}

// Function to calculate and store the total price in localStorage
const calculateTotalPrice = () => {
  let totalPrice = carts.reduce((acc, cart) => {
      let product = listProducts.find(p => p.id == cart.product_id);
      if (product) {
          return acc + product.price * cart.quantity;
      }
      return acc;
  }, 0);
  localStorage.setItem("totalPrice", totalPrice.toFixed(2)); // Store as a string with two decimal places
};

// Modify addCartToHTML to call calculateTotalPrice after updating cart HTML
const addCartToHTML = () => {
  listCartHTML.innerHTML = '';
  let totalQuantity = 0;

  if (carts.length > 0) {
      carts.forEach(cart => {
          totalQuantity += cart.quantity;
          let positionProduct = listProducts.findIndex(value => value.id == parseInt(cart.product_id));

          if (positionProduct >= 0) {
              let info = listProducts[positionProduct];
              let newCart = document.createElement('div');
              newCart.classList.add('item');
              newCart.dataset.id = cart.product_id;
              let totalPrice = (info.price * cart.quantity).toFixed(2);

              newCart.innerHTML = `
                  <div class="image">
                      <img src="${info.image}" alt="">
                  </div>
                  <div class="name">${info.name}</div>
                  <div class="totalPrice">R${totalPrice}</div>
                  <div class="quantity">
                      <span class="minus"><</span>
                      <span>${cart.quantity}</span>
                      <span class="plus">></span>
                  </div>`;
              
              listCartHTML.appendChild(newCart);
          }
      });
  }

  iconCartSpan.innerText = totalQuantity;
  calculateTotalPrice(); // Call to update total price in localStorage
};

function displayWomenProducts() {
  fetch('../women-product.json')
    .then(response => response.json())
    .then(data => {
      const productsContainer = document.querySelector('.women-shop');
      productsContainer.innerHTML = '';

      data.forEach(product => {
        const productItem = `
          <div class="m-item" data-id="${product.id}">
            <div class="m-pic">
              <img class="m-preview" src="${product.image}" alt="${product.name}">
            </div>
            <div class="desc">
              <p class="clothing-item">${product.name}</p>
              <p class="women-price">R${product.price}</p>
              <button class="cartButton">Add to Cart</button>
            </div>
          </div>
        `;
        productsContainer.innerHTML += productItem;
      });
      reapplyCartListeners(); // Apply event listeners after products are loaded
    })
    .catch(error => console.error('Error loading women products:', error));
}

const reapplyCartListeners = () => {
  const cartButton = (product_id) => {
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
    
    if (positionThisProductInCart < 0) {
      // Product is not in cart, so add it
      carts.push({
        product_id: product_id,
        quantity: 1
      });
    } else {
      // Product is already in the cart, so increase the quantity
      carts[positionThisProductInCart].quantity += 1;
    }
  }
  
  addCartToHTML();
  addCartToMemory();
}

document.addEventListener('DOMContentLoaded', displayWomenProducts);


// Update product quantity in the cart
listCartHTML.addEventListener('click', (event) => {
  let positionClick = event.target;
  
  if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
    let product_id = positionClick.closest('.item').dataset.id;
    
    let type = positionClick.classList.contains('plus') ? 'plus' : 'minus';
    
    changeQuantity(product_id, type);
  }
});

// Adjust the cart quantity (increase/decrease)
const changeQuantity = (product_id, type) => {
  let positionItemInCart = carts.findIndex((value) => value.product_id == product_id);
  
  if (positionItemInCart >= 0) {
    switch (type) {
      case 'plus':
        carts[positionItemInCart].quantity += 1;
        break;
        
      case 'minus':
        let newQuantity = carts[positionItemInCart].quantity - 1;
        
        if (newQuantity > 0) {
          carts[positionItemInCart].quantity = newQuantity;
        } else {
          carts.splice(positionItemInCart, 1);
        }
        break;
    }
  }
  
  addCartToMemory();
  addCartToHTML();
}

// Initialize the app and load product data based on page
const initApp = () => {
  if (window.location.pathname.includes('men.html')) {
    currentPage = 'men'; // For men products
    fetch('../men-product.json')
      .then(response => response.json())
      .then(data => {
        listProducts = data;
        addDataToHTML();

        if (localStorage.getItem('men_cart')) {
          carts = JSON.parse(localStorage.getItem('men_cart'));
          addCartToHTML();
        }
      });
  } else if (window.location.pathname.includes('women.html')) {
    currentPage = 'women'; // For women products
    fetch('../women-product.json')
      .then(response => response.json())
      .then(data => {
        listProducts = data;
        addDataToHTML();

        if (localStorage.getItem('women_cart')) {
          carts = JSON.parse(localStorage.getItem('women_cart'));
          addCartToHTML();
        }
      });
  }
}

initApp();
