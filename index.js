//query selectors
const ingredientForm = document.querySelector("#ingredient-form");
const resultsContainer = document.querySelector("#results");
const orderStatusMessage = document.querySelector("#order-status");
const incompleteOrdersContainer = document.querySelector("#incompleteOrders");
const actionOrderForm = document.querySelector("#action-order-form");
const searchErrorMessageContainer = document.querySelector(
  "#searchErrorMessage"
);
const orderNumInput = document.querySelector("#orderNum");

let meals;

ingredientForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fetchAndRenderMeals();
});

async function fetchAndRenderMeals() {
  let errorMsg = document.createElement("p");
  const rawIngredientInput = document.querySelector("#ingredient");
  const formattedRawIngredient = rawIngredientInput.value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  console.log(formattedRawIngredient);

  if (!formattedRawIngredient) {
    errorMsg.innerHTML = `Please enter an ingredient.`;
    errorMsg.className = "text-danger text-center fs-5 my-3";
    searchErrorMessageContainer.appendChild(errorMsg);
    myTimeout = setTimeout(() => {
      errorMsg.remove();
    }, 2000);
    rawIngredientInput.focus();
    return;
  }
  //using a promise
  //   let response = fetch(
  //     `https://www.themealdb.com/api/json/v1/1/filter.php?i=${rawIngredient}`
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //     });
  try {
    let response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${formattedRawIngredient}`
    );

    let data = await response.json();
    meals = data.meals;

    if (!meals) {
      errorMsg.innerHTML = `No meals found for ${formattedRawIngredient}. Please try another ingredient.`;
      errorMsg.className = "text-danger text-center fs-5 my-3";
      searchErrorMessageContainer.appendChild(errorMsg);
      myTimeout = setTimeout(() => {
        errorMsg.innerHTML = "";
        searchErrorMessageContainer.appendChild(errorMsg);
      }, 2000);

      rawIngredientInput.value = "";
      rawIngredientInput.focus();
      // Recursion: call this function again after alert
      return;
    }

    let resultsRow = document.createElement("div");
    resultsRow.className =
      "row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-4";
    //show the results container
    resultsContainer.innerHTML = "";
    resultsContainer.classList.remove("d-none");
    resultsContainer.classList.add("d-flex");

    meals.forEach((element) => {
      let col = document.createElement("div");
      col.className = "col";

      col.innerHTML = `
              <div class="card text-center" >
              <img class="card-img-top"src="${element.strMealThumb}" />
              <div class="card-body">
                  <h5 class="card-title">${element.strMeal}</h5>
              </div>
              </div>
          `;
      resultsRow.appendChild(col);

      //select a ramdom meal for the chef
    });

    resultsContainer.appendChild(resultsRow);
    orderStatusMessage.textContent = "Selecting Chef's favourite order...";

    //wait 2 seconds
    myTimeout = setTimeout(() => {
      console.log(orderStatusMessage);

      placeOrder();
      renderIncompleteOrders();

      resultsContainer.classList.remove("d-flex");
      resultsContainer.classList.add("d-none");
      rawIngredientInput.value = "";
    }, 3000);
  } catch (error) {
    alert("Error fetching data. Please try again later.");
    rawIngredientInput.value = "";
  }
}

actionOrderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputValue = parseInt(orderNum.value);
  console.log(inputValue);

  // 0 means "do nothing"
  if (inputValue === 0) {
    alert("No order completed.");
    orderNum.value = "";
    orderNum.focus();
    return;
  }

  let existingOrders = JSON.parse(sessionStorage.getItem("orders"));

  //get the index of the user entered order number
  let orderIndex = existingOrders.findIndex(function (order) {
    return (
      (order.orderNumber === inputValue) & (order.orderStatus != "completed")
    );
  });

  //does the ordernumber exist
  if (orderIndex != -1) {
    let result = existingOrders.find(
      (order) => order.orderNumber === inputValue
    );
    let newRecord = {
      orderNumber: result.orderNumber,
      orderStatus: "completed",
      description: result.description,
    };
    console.log(result);
    existingOrders.splice(orderIndex, 1, newRecord);
  }

  if (orderIndex === -1) {
    alert(`Order ${inputValue} not found.`);
    orderNum.value = "";
    orderNum.focus();
    return;
  }

  orderStatusMessage.textContent = `Order ${inputValue} marked as completed`;
  setTimeout(() => {
    orderStatusMessage.textContent = "";
  }, 2000);

  //overwrite the orders in session storage
  sessionStorage.setItem("orders", JSON.stringify(existingOrders));

  renderIncompleteOrders();
  orderNum.value = "";
});

function placeOrder() {
  //get a randomnumber between 0 and lenght-1
  const randonlySelectedMeal = Math.floor(Math.random() * meals.length);

  console.log(randonlySelectedMeal);
  //get last order (if there is one) from session storage
  let lastOrderNumber =
    parseInt(sessionStorage.getItem("lastOrderNumber")) || 0;
  console.log(lastOrderNumber);

  //if existing orders
  //add to existing order array
  let existingOrders = JSON.parse(sessionStorage.getItem("orders"));
  if (existingOrders) {
    console.log("in existing" + existingOrders);
    const newOrderDetails = {
      orderNumber: lastOrderNumber + 1,
      orderStatus: "incomplete",
      description: meals[randonlySelectedMeal].strMeal,
    };
    existingOrders.push(newOrderDetails);
    console.log(existingOrders);

    sessionStorage.setItem("orders", JSON.stringify(existingOrders));
  } else {
    //create new array

    const newOrderDetails = [
      {
        orderNumber: lastOrderNumber + 1,
        orderStatus: "incomplete",
        description: meals[randonlySelectedMeal].strMeal,
      },
    ];
    //store in session storage
    sessionStorage.setItem("orders", JSON.stringify(newOrderDetails));
  }

  //update last order number
  sessionStorage.setItem("lastOrderNumber", lastOrderNumber + 1);

  //update chef message
  //make this dissapear after 4 seconds
  orderStatusMessage.textContent = "Order placed";
  //wait 2 seconds
  const myTimeout = setTimeout(() => {
    console.log(orderStatusMessage);

    orderStatusMessage.textContent = "";
  }, 2000);
}

function renderIncompleteOrders() {
  incompleteOrdersContainer.innerHTML = "";
  //get the incomplete orders
  let existingOrders = JSON.parse(sessionStorage.getItem("orders"));

  console.log(existingOrders);

  if (existingOrders) {
    const incompleteOrders = existingOrders.filter((order) => {
      return order.orderStatus != "completed";
    });

    //show action order form

    actionOrderForm.classList.remove("d-none");
    actionOrderForm.classList.add("d-flex");
    console.log(incompleteOrders);
    //render all to the bottom div

    let row = document.createElement("div");
    row.className = "row";

    incompleteOrders.forEach((order) => {
      let col = document.createElement("div");
      col.className =
        "col-md-2 bg-light p-3 d-flex justify-content-center align-items-center";

      col.innerHTML = `<div class="card text-center" style="width: 10rem;">
        <div class="card-body">
            <h5 class="card-title">${order.orderNumber}</h5>
            <p class="card-text">${order.description}</p>
            </div>
        </div>
        `;

      row.appendChild(col);
    });

    incompleteOrdersContainer.appendChild(row);
  }
}

function init() {
  renderIncompleteOrders();
}

init();
