var currentTime = 0;
var animationDelay = 25;
var cellsPerStep = 1;
const IDLE = 0;
const BUSY = 1;
const ICAOFFICER = 0;
var isRunning = false;
var surface;

const width = 1920;
const height = 540;

var probArrival = 0.3;
var probImmigration = 0.1;

var positions = {
  arrivals: 0,
  immigration: 0,
  testing: 0,
  baggage: 0,
  exiting: 5,
  undefined: 0,
};

var numStations = Object.keys(positions).length - 3; // ES5 and beyond.

var objects = {
  immigration: [],
  immigrationQueue: [],
  passengers: [],
  testing: [],
  testingBox: [],
  testingQueue: [],
};

var numImmigrationOfficers = 1;
var numTestingDoctors = 1;

function updateTextInput(val) {
  document.getElementById("textInput").value = val;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function numImmigrationOfficersChange() {
  if (isRunning) {
    alert(
      "Please stop the model first before changing this parameter. Changing the parameter will reset the simulation."
    );
    let select = document.querySelector("#immigrationNum");
    select.value = String(numImmigrationOfficers);
  } else {
    numImmigrationOfficers = Number(
      document.getElementsByName("immigrationNum")[0].value
    );
    redrawWindow();
  }
}

function numTestingDoctorsChange() {
  if (isRunning) {
    alert(
      "Please stop the model first before changing this parameter. Changing the parameter will reset the simulation."
    );
    let select = document.querySelector("#testingNum");
    select.value = String(numTestingDoctors);
  } else {
    numTestingDoctors = Number(
      document.getElementsByName("testingNum")[0].value
    );
    redrawWindow();
  }
}

function onChange1() {
  if (isRunning) {
    alert(
      "Please stop the model first before changing this parameter. Changing the parameter will reset the simulation."
    );
  } else {
    var choice1 = document.getElementsByName("choices1")[0].value;
    if (choice1 == "none") {
      let position2 = getKeyByValue(positions, 2);
      positions[position2] = 0;
    } else {
      let position2 = getKeyByValue(positions, 2);
      let position3 = getKeyByValue(positions, 3);
      let position4 = getKeyByValue(positions, 4);
      if (choice1 == position3 || choice1 == position4) {
        alert("Duplicates found. Please choose a different station.");
        let select = document.querySelector("#select1");
        select.value = "none";
      } else {
        positions[choice1] = 2;
      }
      positions[position2] = 0;
    }
    redrawWindow();
    console.log(positions);
  }
}

function onChange2() {
  if (isRunning) {
    alert(
      "Please stop the model first before changing this parameter. Changing the parameter will reset the simulation."
    );
  } else {
    var choice2 = document.getElementsByName("choices2")[0].value;
    if (choice2 == "none") {
      let position3 = getKeyByValue(positions, 3);
      positions[position3] = 0;
    } else {
      let position2 = getKeyByValue(positions, 2);
      let position3 = getKeyByValue(positions, 3);
      let position4 = getKeyByValue(positions, 4);
      if (choice2 == position2 || choice2 == position4) {
        alert("Duplicates found. Please choose a different station.");
        let select = document.querySelector("#select2");
        select.value = "none";
      } else {
        positions[choice2] = 3;
      }
      positions[position3] = 0;
    }
    redrawWindow();
    console.log(positions);
  }
}

function onChange3() {
  if (isRunning) {
    alert(
      "Please stop the model first before changing this parameter. Changing the parameter will reset the simulation."
    );
  } else {
    var choice3 = document.getElementsByName("choices3")[0].value;
    if (choice3 == "none") {
      let position4 = getKeyByValue(positions, 4);
      positions[position4] = 0;
    } else {
      let position2 = getKeyByValue(positions, 2);
      let position3 = getKeyByValue(positions, 3);
      let position4 = getKeyByValue(positions, 4);
      if (choice3 == position2 || choice3 == position3) {
        alert("Duplicates found. Please choose a different station.");
        let select = document.querySelector("#select3");
        select.value = "none";
      } else {
        positions[choice3] = 4;
      }
      positions[position4] = 0;
    }
    redrawWindow();
    console.log(positions);
  }
}

function createImmigrationOfficers() {
  if (positions.immigration > 0) {
    for (let i = 1; i <= numImmigrationOfficers; i++) {
      let newRow = (height * i) / (numImmigrationOfficers + 1);
      newRow = newRow.toFixed(0);

      let newCol = (width * (positions.immigration - 1)) / (numStations + 1);
      newCol = newCol.toFixed(0);

      let newImmigrationOfficer = {
        id: i,
        type: ICAOFFICER,
        label: "ICAOfficer",
        row: newRow,
        col: newCol,
        state: "IDLE",
      };

      objects.immigration.push(newImmigrationOfficer);
    }
  } else {
    objects.immigration = [];
  }
}

function createTestingDoctors() {
  if (positions.testing > 0) {
    for (let i = 1; i <= numTestingDoctors; i++) {
      let newRow = (height * i) / (numTestingDoctors + 1);
      newRow = newRow.toFixed(0);

      let newCol = (width * (positions.testing - 1)) / (numStations + 1);
      newCol = newCol.toFixed(0);

      let newTestingDoctor = {
        id: i,
        row: newRow,
        col: newCol,
        state: "IDLE",
      };

      objects.testing.push(newTestingDoctor);
    }
  } else {
    objects.testing = [];
  }
}

function createImmigrationQueues() {
  if (positions.immigration > 0) {
    for (let i = 1; i <= numImmigrationOfficers; i++) {
      let newRow = (height * i) / (numImmigrationOfficers + 1);
      newRow = newRow.toFixed(0);

      let newCol = (width * (positions.immigration - 1)) / (numStations + 1);
      newCol -= 110;
      newCol = newCol.toFixed(0);

      let newImmigrationQueue = {
        id: i,
        row: newRow,
        col: newCol,
        state: IDLE,
        stack: 0,
      };

      objects.immigrationQueue.push(newImmigrationQueue);
    }
  } else {
    objects.immigrationQueue = [];
  }
}

function createTestingQueues() {
  if (positions.testing > 0) {
    for (let i = 1; i <= numTestingDoctors; i++) {
      let newRow = (height * i) / (numTestingDoctors + 1);
      newRow = newRow.toFixed(0);

      let newCol = (width * (positions.testing - 1)) / (numStations + 1);
      newCol -= 110;
      newCol = newCol.toFixed(0);

      let newTestingQueue = {
        id: i,
        row: newRow,
        col: newCol,
        state: IDLE,
        stack: 0,
      };

      objects.testingQueue.push(newTestingQueue);
    }
  } else {
    objects.testingQueue = [];
  }
}

function createTestingBox() {
  if (positions.testing > 0) {
    let newRow = height / (numTestingDoctors + 1) - 20;
    newRow = newRow.toFixed(0);
    let newCol = (width * (positions.testing - 1)) / (numStations + 1);
    newCol += 48;
    newCol = newCol.toFixed(0);

    let secondRow = (height * numTestingDoctors) / (numTestingDoctors + 1) + 28;
    secondRow = secondRow.toFixed(0);

    let newHeight = secondRow - newRow;

    let newTestingBox = {
      row: newRow,
      col: newCol,
      height: newHeight,
      width: 75,
      stack: 0,
    };

    objects.testingBox.push(newTestingBox);
  }
}

function addDynamicAgents() {
  if (Math.random() < probArrival) {
    let station = 2;
    let newState = getKeyByValue(positions, 2);
    if (newState == undefined) {
      newState = getKeyByValue(positions, 3);
      station = 3;
      if (newState == undefined) {
        newState = getKeyByValue(positions, 4);
        station = 4;
      }
    }
    let queueState = newState + "Queue";

    let chosenQueue = 0;

    for (let i in objects[queueState]) {
      if (i !== "0") {
        if (
          Number(objects[queueState][i].stack) <
          Number(objects[queueState][chosenQueue].stack)
        ) {
          chosenQueue = Number(i);
        }
      }
    }

    let stackOverflow = 0;

    if (Number(objects[queueState][chosenQueue].stack) > 100) {
      stackOverflow = Number(objects[queueState][chosenQueue].stack) - 100;
    }

    let newPassenger = {
      id: 1,
      row: height / 2,
      col: 0,
      state: newState,
      queueState: queueState,
      chosenQueue: chosenQueue,
      targetRow: Number(objects[queueState][chosenQueue].row) + 3,
      targetCol: Number(objects[queueState][chosenQueue].col) - stackOverflow,
      station: station,
    };
    objects.passengers.push(newPassenger);
    let newStack = Number(objects[queueState][chosenQueue].stack) + 1;
    objects[queueState][chosenQueue].stack = newStack;
  }
}

function updateSurface() {
  let allPassengers = surface.selectAll(".passenger").data(objects.passengers);
  allPassengers.exit().remove();

  let newPassengers = allPassengers
    .enter()
    .append("g")
    .attr("class", "passenger");

  newPassengers
    .append("svg")
    .append("rect")
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("height", "2px")
    .attr("width", "2px")
    .attr("fill", "yellow")
    .attr("stroke", "black");

  let passengers = allPassengers.selectAll("rect");

  passengers
    .transition()
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .duration(animationDelay)
    .ease(d3.easeLinear());
}

function updateDynamicAgents() {
  for (let index in objects.passengers) {
    updatePassenger(index);
  }
  updateSurface();
}

function updatePassenger(index) {
  index = Number(index);
  let passenger = objects.passengers[index];
  let row = Number(passenger.row);
  let col = Number(passenger.col);
  let state = passenger.state;
  let queueState = passenger.queueState;
  let chosenQueue = Number(passenger.chosenQueue);

  let hasArrived =
    Math.abs(Number(passenger.targetRow) - row) +
      Math.abs(Number(passenger.targetCol) - col) ==
    0;

  switch (state) {
    case "immigration":
      if (queueState == "immigrationQueue" && hasArrived) {
        if (
          col == Number(objects[queueState][chosenQueue].col) + 100 &&
          objects.immigration[chosenQueue].state == "IDLE"
        ) {
          passenger.queueState = "none";
          passenger.targetRow =
            Number(objects.immigration[chosenQueue].row) + 3;
          passenger.targetCol =
            Number(objects.immigration[chosenQueue].col) - 1;
          let newStack =
            Number(objects.immigrationQueue[chosenQueue].stack) - 1;
          objects.immigrationQueue[chosenQueue].stack = newStack;
          objects.immigration[chosenQueue].state = "BUSY";
        } else if (col < Number(objects[queueState][chosenQueue].col) + 100) {
          let filledCol = objects.passengers.filter(function (i) {
            return i.col == col + 1 && i.row == row;
          });

          if (filledCol.length == 0) {
            passenger.targetCol = col + 1;
          }
        }
      } else if (queueState == "none" && hasArrived) {
        if (Math.random() < probImmigration) {
          // TODO Create function callable by the different states.
          // ? Could probably do a recursive function for this.
          objects.immigration[chosenQueue].state = "IDLE";
          let station = Number(passenger.station);
          station += 1;
          let newState = getKeyByValue(positions, station);
          if (newState == undefined) {
            newState = getKeyByValue(positions, station + 1);
            station += 1;
            if (newState == undefined) {
              newState = getKeyByValue(positions, station + 1);
              station += 1;
            } // Final state if nothing else will be "out".
          }

          if (newState == "exiting") {
            passenger.state = "exiting";
            passenger.targetCol = width;
            passenger.targetRow = height / 2;
          } else {
            passenger.state = newState;
            queueState = newState + "Queue";
            passenger.queueState = queueState;

            function chosenQueueRectifier(chosenQueue) {
              if (chosenQueue >= objects[queueState].length) {
                chosenQueue -= 1;
                return chosenQueueRectifier(chosenQueue);
              } else {
                return chosenQueue;
              }
            }

            chosenQueue = chosenQueueRectifier(chosenQueue);

            for (let i in objects[queueState]) {
              if (i !== chosenQueue) {
                if (
                  Number(objects[queueState][i].stack) <
                  Number(objects[queueState][chosenQueue].stack)
                ) {
                  chosenQueue = Number(i);
                }
              }
            }

            let stackOverflow = 0;

            if (Number(objects[queueState][chosenQueue].stack) > 100) {
              stackOverflow =
                Number(objects[queueState][chosenQueue].stack) - 100;
            }

            passenger.targetRow =
              Number(objects[queueState][chosenQueue].row) + 3;
            passenger.targetCol =
              Number(objects[queueState][chosenQueue].col) - stackOverflow;
            passenger.station = station;
            passenger.chosenQueue = chosenQueue;
            let newStack = Number(objects[queueState][chosenQueue].stack) + 1;
            objects[queueState][chosenQueue].stack = newStack;
          }
        }
      }
      console.log(state);
      console.log(queueState);
      break;
    // case "testing":
    //   if ()
    //   break;
    case "exiting":
      if (hasArrived) {
        passenger.state = "out";
      }
      break;
  }

  let targetRow = Number(passenger.targetRow);
  let targetCol = Number(passenger.targetCol);
  // compute the distance to the target destination
  let rowsToGo = targetRow - row;
  let colsToGo = targetCol - col;
  // set the speed
  let cellsPerStep = 1;
  // compute the cell to move to
  let newRow =
    row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo);
  let newCol =
    col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo);
  // update the location of the passenger
  passenger.row = newRow;
  passenger.col = newCol;
}

function redrawWindow() {
  /**
   * TODO Draw all the specified stations.
   */
  currentTime = 0;
  isRunning = false;
  var drawSurface = document.getElementById("surface");
  drawSurface.style.border = "thin solid #333333";
  d3.select("#surface").selectAll("*").remove();
  surface = d3.select("#surface"); //

  objects.immigration = [];
  objects.immigrationQueue = [];
  objects.passengers = [];
  objects.testing = [];
  objects.testingBox = [];
  objects.testingQueue = [];
  createImmigrationOfficers();
  createImmigrationQueues();
  createTestingDoctors();
  createTestingBox();
  createTestingQueues();

  var allImmigrationOfficers = surface
    .selectAll(".immigration")
    .data(objects.immigration);

  var allImmigrationQueues = surface
    .selectAll(".immigrationQueue")
    .data(objects.immigrationQueue);

  var allTestingDoctors = surface.selectAll(".testing").data(objects.testing);

  var allTestingBoxes = surface
    .selectAll(".testingBox")
    .data(objects.testingBox);

  var allTestingQueues = surface
    .selectAll(".testingQueue")
    .data(objects.testingQueue);

  allImmigrationOfficers.exit().remove();
  allImmigrationQueues.exit().remove();
  allTestingDoctors.exit().remove();
  allTestingBoxes.exit().remove();

  var newImmigrationOfficers = allImmigrationOfficers
    .enter()
    .append("g")
    .attr("class", "immigration");

  var newImmigrationQueues = allImmigrationQueues
    .enter()
    .append("g")
    .attr("class", "immigrationQueue");

  var newTestingDoctors = allTestingDoctors
    .enter()
    .append("g")
    .attr("class", "testing");

  var newTestingBoxes = allTestingBoxes
    .enter()
    .append("g")
    .attr("class", "testingBox");

  var newTestingQueues = allTestingQueues
    .enter()
    .append("g")
    .attr("class", "testingQueue");

  newImmigrationOfficers
    .append("svg")
    .append("rect")
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("height", "8px")
    .attr("width", "8px")
    .attr("fill", "rebeccapurple");

  newImmigrationOfficers
    .append("text")
    .attr("x", function (d) {
      return Number(d.col) + "px";
    })
    .attr("y", function (d) {
      return Number(d.row) + 18 + "px";
    })
    .attr("dy", ".35em")
    .text("Immigration");

  newImmigrationQueues
    .append("svg")
    .append("rect")
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("height", "8px")
    .attr("width", "100px")
    .attr("fill", "transparent")
    .attr("stroke", "rebeccapurple");

  newTestingDoctors
    .append("svg")
    .append("rect")
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("height", "8px")
    .attr("width", "8px")
    .attr("fill", "palevioletred");

  newTestingDoctors
    .append("text")
    .attr("x", function (d) {
      return Number(d.col) + "px";
    })
    .attr("y", function (d) {
      return Number(d.row) + 18 + "px";
    })
    .attr("dy", ".35em")
    .text("Testing");

  newTestingBoxes
    .append("svg")
    .append("rect")
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("height", function (d) {
      return d.height + "px";
    })
    .attr("width", function (d) {
      return d.width + "px";
    })
    .attr("fill", "transparent")
    .attr("stroke", "palevioletred");

  newTestingQueues
    .append("svg")
    .append("rect")
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("height", "8px")
    .attr("width", "100px")
    .attr("fill", "transparent")
    .attr("stroke", "palevioletred");

  surface.style("font-size", "x-small");

  updateSurface();
}

function removeDynamicAgents() {
  let allPassengers = surface.selectAll(".passenger").data(object.passengers);
  let exitingPassengers = allPassengers.filter(function (d) {
    return d.state == "out";
  });
  exitingPassengers.remove();
  objects.passengers = objects.passengers.filter(function (d) {
    return d.state != "out";
  });
}

function simStep() {
  if (isRunning) {
    currentTime += 1;
    addDynamicAgents();
    updateDynamicAgents();
    removeDynamicAgents();
  }
}

function runSim() {
  let choice1 = document.getElementsByName("choices1")[0].value;
  let choice2 = document.getElementsByName("choices2")[0].value;
  let choice3 = document.getElementsByName("choices3")[0].value;

  if (choice1 == "none" && choice2 == "none" && choice3 == "none") {
    alert("Please make at least one station choice.");
  } else if (isRunning) {
    alert("Already running.");
  } else {
    isRunning = true;
    simTimer = window.setInterval(simStep, animationDelay);
  }
}

function pause() {
  isRunning = false;
}

redrawWindow();
