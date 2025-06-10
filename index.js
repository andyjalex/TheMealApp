//query selectors
const ingredientForm = document.querySelector("#ingredient-form");
const resultsContainer = document.querySelector("#results");
const orderStatusMesaage = document.querySelector("#order-status");
const incompleteOrdersContainer = document.querySelector("#incompleteOrders");
const actionOrderForm = document.querySelector("#actionOrder");

let meals;

ingredientForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const rawIngredient = document.querySelector("#ingredient").value.trim();
  const formattedRawIngredient = rawIngredient
    .toLowerCase()
    .replace(/\s+/g, "_");
  console.log(formattedRawIngredient);

  console.log(rawIngredient);

  resultsContainer.innerHTML = "";

  //   let response = fetch(
  //     `https://www.themealdb.com/api/json/v1/1/filter.php?i=${rawIngredient}`
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //     });

  let response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${formattedRawIngredient}`
  );

  let data = await response.json();
  console.log(data);

  if (data) {
    //clear the resutsContainer
    let resultsRow = document.createElement("div");
    resultsRow.className = "row";
    meals = data.meals;

    const results = meals.forEach((element) => {
      console.log(element);
      let col = document.createElement("div");
      col.className = "col-md-4 bg-light p-3 d-flex";

      col.innerHTML = `
            <div class="card text-center" style="width: 18rem;">
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
    orderStatusMesaage.textContent = "Selecting Chef's favourite order...";

    //wait 2 seconds
    const myTimeout = setTimeout(() => {
      console.log(orderStatusMesaage);

      placeOrder();
    }, 2000);

    renderIncompleteOrders();
  }
});

actionOrderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputValue = parseInt(orderNum.value);

  let existingOrders = JSON.parse(sessionStorage.getItem("orders"));

  //get the index of the user entered order number
  let orderIndex = existingOrders.findIndex(function (order) {
    return order.orderNumber === inputValue;
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

  //overwrite the orders in session storage
  sessionStorage.setItem("orders", JSON.stringify(existingOrders));

  renderIncompleteOrders();
});

function placeOrder() {
  console.log("Chef orders ");

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
    console.log("in existing");
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
  orderStatusMesaage.textContent = "Order placed";
  //wait 2 seconds
  const myTimeout = setTimeout(() => {
    console.log(orderStatusMesaage);

    orderStatusMesaage.textContent = "";
  }, 2000);
}

function renderIncompleteOrders() {
  incompleteOrdersContainer.innerHTML = "";
  //get the incomplete orders
  let existingOrders = JSON.parse(sessionStorage.getItem("orders"));

  const incompleteOrders = existingOrders.filter((order) => {
    return order.orderStatus != "completed";
  });
  console.log(incompleteOrders);
  //render all to the bottom div

  let row = document.createElement("div");
  row.className = "row";

  incompleteOrders.forEach((order) => {
    let col = document.createElement("div");
    col.className = "col-md-4 bg-light p-3 d-flex";

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

  //render latest 3 to the latest order div
}

function init() {
  renderIncompleteOrders();
}

init();
