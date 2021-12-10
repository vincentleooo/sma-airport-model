/*
? In this code you will see the variables and object keys referring to stacks.
! Know that they are not technically stacks but instead queues (FIFO).
* I wanted to make the Stack Overflow joke.
*/

var currentTime = 0;
var animationDelay = 20;
var cellsPerStep = 1;
const IDLE = 0;
const BUSY = 1;
const ICAOFFICER = 0;
var isRunning = false;
var isPaused = false;
var surface;

const width = 960;
const height = 540;

var probArrival = 0.5;
var probImmigration = 0.5;
var probTesting = 0.5;
var testingTime = 40;
var probCovid = 0.5;
var probFindBaggage = 0.5;
var randomChosenQueue = 0.3;
var exitedPassengers = 0;
var passengerCount = 150;
var enteredPassengers = 0;
var simulationRuns = 1;
var simulationsRan = 0;
var listTimeToClear = [];
var listMeanTimeToClear = [];
var listSimulationRunTime = [];

function changeProb() {
  if (isRunning || isPaused) {
    alert(
      "Please reset the model first before changing this parameter. Changing the parameter will reset the simulation."
    );
  } else {
    probArrival = 1 / Number(document.getElementById("probArrival").value);
    probImmigration =
      1 / Number(document.getElementById("probImmigration").value);
    probTesting = 1 / Number(document.getElementById("probTesting").value);
    probCovid = Number(document.getElementById("probCOVID").value);
    testingTime = Number(document.getElementById("timeTest").value);
    probFindBaggage = Number(document.getElementById("probBaggage").value);
    animationDelay = Number(document.getElementById("animationDelay").value);
    passengerCount = Number(document.getElementById("passengerCount").value);
    simulationRuns = Number(document.getElementById("simulationRuns").value);
  }
}

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
  baggage: [],
  baggageQueue: [],
};

var numImmigrationOfficers = 1;
var numTestingDoctors = 1;
var numBaggageQueues = 1;

function updateTextInput(val) {
  document.getElementById("textInput").value = val;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function numImmigrationOfficersChange() {
  if (isRunning || isPaused) {
    alert(
      "Please reset the model first before changing this parameter. Changing the parameter will reset the simulation."
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
  if (isRunning || isPaused) {
    alert(
      "Please reset the model first before changing this parameter. Changing the parameter will reset the simulation."
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

function numBaggageQueuesChange() {
  if (isRunning || isPaused) {
    alert(
      "Please reset the model first before changing this parameter. Changing the parameter will reset the simulation."
    );
    let select = document.querySelector("#queueNum");
    select.value = String(numBaggageQueues);
  } else {
    numBaggageQueues = Number(document.getElementsByName("queueNum")[0].value);
    redrawWindow();
  }
}

function onChange1() {
  if (isRunning || isPaused) {
    alert(
      "Please reset the model first before changing this parameter. Changing the parameter will reset the simulation."
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
  }
}

function onChange2() {
  if (isRunning || isPaused) {
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
  }
}

function onChange3() {
  if (isRunning || isPaused) {
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

function createBaggageArea() {
  if (positions.baggage > 0) {
    let newRow = height * 0.35;
    newRow = newRow.toFixed(0);
    let newCol = (width * (positions.baggage - 1)) / (numStations + 1) + 25;
    newCol = newCol.toFixed(0);
    let newHeight = height * 0.3;
    newHeight = newHeight.toFixed(0);

    let newBaggage = {
      row: newRow,
      col: newCol,
      height: newHeight,
      width: 50,
    };

    objects.baggage.push(newBaggage);
  } else {
    objects.baggage = [];
  }
}

function createImmigrationQueues() {
  if (positions.immigration > 0) {
    for (let i = 1; i <= numImmigrationOfficers; i++) {
      let newRow = (height * i) / (numImmigrationOfficers + 1);
      newRow = newRow.toFixed(0);

      let newCol = (width * (positions.immigration - 1)) / (numStations + 1);
      newCol -= 60;
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
      newCol -= 60;
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

function createBaggageAreaQueue() {
  if (positions.baggage > 0) {
    for (let i = 1; i <= numBaggageQueues; i++) {
      let newRow = (height * i) / (numBaggageQueues + 1);
      newRow = newRow.toFixed(0);

      let newCol = (width * (positions.baggage - 1)) / (numStations + 1);
      newCol -= 35;
      newCol = newCol.toFixed(0);

      let newBaggageAreaQueue = {
        id: i,
        row: newRow,
        col: newCol,
        state: IDLE,
        stack: 0,
      };

      objects.baggageQueue.push(newBaggageAreaQueue);
    }
  } else {
    objects.baggageQueue = [];
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
      width: 50,
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

    if (Number(objects[queueState][chosenQueue].stack) > 50) {
      stackOverflow = Number(objects[queueState][chosenQueue].stack) - 50;
    }

    let covid = false;

    if (Math.random() < probCovid) {
      covid = true;
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
      timeWaited: 0,
      covid: covid,
      timeTaken: 0,
    };
    objects.passengers.push(newPassenger);
    let newStack = Number(objects[queueState][chosenQueue].stack) + 1;
    objects[queueState][chosenQueue].stack = newStack;
    enteredPassengers += 1;
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
    .attr("width", "1px")
    .attr("fill", function (d) {
      if (d.state == "covid") {
        return "red";
      } else {
        return "black";
      }
    })
    .attr("stroke", function (d) {
      if (d.state == "covid") {
        return "purple";
      } else {
        return "green";
      }
    });

  let passengers = allPassengers.selectAll("rect");

  passengers
    .transition()
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("fill", function (d) {
      if (d.state == "covid") {
        return "red";
      } else {
        return "black";
      }
    })
    .attr("stroke", function (d) {
      if (d.state == "covid") {
        return "red";
      } else {
        return "black";
      }
    })
    .duration(animationDelay)
    .ease(d3.easeLinear);
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
          col == Number(objects[queueState][chosenQueue].col) + 50 &&
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
        } else if (col < Number(objects[queueState][chosenQueue].col) + 50) {
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
              //* Recursive function when having mismatched station lengths.
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

            if (Math.random() < randomChosenQueue) {
              chosenQueue = Math.floor(
                Math.random() * objects[queueState].length
              );
            }

            let stackOverflow = 0;

            if (Number(objects[queueState][chosenQueue].stack) > 50) {
              stackOverflow =
                Number(objects[queueState][chosenQueue].stack) - 50;
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
      break;
    case "testing":
      if (queueState == "testingQueue" && hasArrived) {
        if (
          col == Number(objects[queueState][chosenQueue].col) + 50 &&
          objects.testing[chosenQueue].state == "IDLE"
        ) {
          passenger.queueState = "testBox";
          passenger.targetRow = Number(objects.testing[chosenQueue].row) + 3;
          passenger.targetCol = Number(objects.testing[chosenQueue].col) - 1;
          let newStack = Number(objects.testingQueue[chosenQueue].stack) - 1;
          objects.testingQueue[chosenQueue].stack = newStack;
          objects.testing[chosenQueue].state = "BUSY";
        } else if (col < Number(objects[queueState][chosenQueue].col) + 50) {
          let filledCol = objects.passengers.filter(function (i) {
            return i.col == col + 1 && i.row == row;
          });

          if (filledCol.length == 0) {
            passenger.targetCol = col + 1;
          }
        }
      } else if (queueState == "testBox" && hasArrived) {
        if (Math.random() < probTesting) {
          passenger.queueState = "enteringTestBox";
          passenger.targetCol = Number(objects.testingBox[0].col) - 1;
          objects.testing[chosenQueue].state = "IDLE";
        }
      } else if (queueState == "enteringTestBox" && hasArrived) {
        let boxWidth = Number(objects.testingBox[0].width);
        let boxHeight = Number(objects.testingBox[0].height);
        let boxRow = Number(objects.testingBox[0].row);
        let boxCol = Number(objects.testingBox[0].col);
        let newCol;
        let newRow;

        let overlapping = true;
        while (overlapping) {
          let count = 1;
          let randRow = Math.floor(Math.random() * boxHeight);
          let randCol = Math.floor(Math.random() * boxWidth);
          newRow = boxRow + randRow;
          newCol = boxCol + randCol;

          let overlappedList = objects.passengers.filter(function (d) {
            return d.targetRow == newRow && d.targetCol == newCol;
          });

          if (overlappedList.length == 0) {
            overlapping = false;
          }

          // ! DEFINE BEHAVIOUR WHEN BOX IS FULL (UNLIKELY, BUT STILL).
          // * FOR NOW, IF BOX IS FULL, ALLOW OVERLAP.
          if (count > boxWidth * boxHeight) {
            overlapping = false;
          }
        }

        passenger.targetCol = newCol;
        passenger.targetRow = newRow;
        passenger.queueState = "waiting";
      } else if (queueState == "waiting" && hasArrived) {
        passenger.timeWaited = Number(passenger.timeWaited) + 1;
        if (passenger.timeWaited >= testingTime && passenger.covid) {
          passenger.state = "covid";
          passenger.targetRow = 0;
        } else if (passenger.timeWaited >= testingTime) {
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
              //* Recursive function when having mismatched station lengths.
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

            if (Math.random() < randomChosenQueue) {
              chosenQueue = Math.floor(
                Math.random() * objects[queueState].length
              );
            }

            let stackOverflow = 0;

            if (Number(objects[queueState][chosenQueue].stack) > 50) {
              stackOverflow =
                Number(objects[queueState][chosenQueue].stack) - 50;
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
      break;
    case "baggage":
      if (queueState == "baggageQueue" && hasArrived) {
        if (col == Number(objects[queueState][chosenQueue].col) + 50) {
          let newStack = Number(objects.baggageQueue[chosenQueue].stack) - 1;
          objects.baggageQueue[chosenQueue].stack = newStack;
          passenger.queueState = "gettingBaggage";
          passenger.targetCol = Number(objects.baggage[0].col) - 1;
          // objects.testing[chosenQueue].state = "BUSY";
        } else if (col < Number(objects[queueState][chosenQueue].col) + 50) {
          let filledCol = objects.passengers.filter(function (i) {
            return i.col == col + 1 && i.row == row;
          });

          if (filledCol.length == 0) {
            passenger.targetCol = col + 1;
          }
        }
      } else if (queueState == "gettingBaggage" && hasArrived) {
        let boxWidth = Number(objects.baggage[0].width);
        let boxHeight = Number(objects.baggage[0].height);
        let boxRow = Number(objects.baggage[0].row);
        let boxCol = Number(objects.baggage[0].col);
        let newCol;
        let newRow;

        let overlapping = true;
        while (overlapping) {
          let count = 1;
          let randRow = Math.floor(Math.random() * boxHeight);
          let randCol = Math.floor(Math.random() * boxWidth);
          newRow = boxRow + randRow;
          newCol = boxCol + randCol;

          let overlappedList = objects.passengers.filter(function (d) {
            return d.targetRow == newRow && d.targetCol == newCol;
          });

          if (overlappedList.length == 0) {
            overlapping = false;
          }

          // ! DEFINE BEHAVIOUR WHEN BOX IS FULL (UNLIKELY, BUT STILL).
          // * FOR NOW, IF BOX IS FULL, ALLOW OVERLAP.
          if (count > boxWidth * boxHeight) {
            overlapping = false;
          }
        }

        passenger.targetCol = newCol;
        passenger.targetRow = newRow;
        passenger.queueState = "reachedBaggage";
      } else if (queueState == "reachedBaggage" && hasArrived) {
        if (Math.random() < probFindBaggage) {
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
              //* Recursive function when having mismatched station lengths.
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

            if (Math.random() < randomChosenQueue) {
              chosenQueue = Math.floor(
                Math.random() * objects[queueState].length
              );
            }

            let stackOverflow = 0;

            if (Number(objects[queueState][chosenQueue].stack) > 50) {
              stackOverflow =
                Number(objects[queueState][chosenQueue].stack) - 50;
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
        } else {
          passenger.queueState = "gettingBaggage";
          hasArrived = true;
        }
      }
      break;
    case "exiting":
      if (hasArrived) {
        passenger.state = "out";
        exitedPassengers += 1;
        document.getElementById("numExited").innerHTML =
          "Number of exited passengers: " + exitedPassengers + ".";
        listTimeToClear.push(Number(passenger.timeTaken));
        newAvg =
          listTimeToClear.reduce((a, b) => a + b) / listTimeToClear.length;
        listMeanTimeToClear.push(newAvg);
        if (isRunning == true) {
          Plotly.extendTraces("tester", { y: [[getData1()]] }, [0]);
          cnt++;
          if (cnt > limit) {
            Plotly.relayout("tester", {
              xaxis: {
                range: [cnt - limit, cnt],
              },
            });
          }
        }
      }
      break;
    case "covid":
      if (hasArrived) {
        passenger.state = "exiting";
      }
  }

  passenger.timeTaken = Number(passenger.timeTaken) + 1;

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
  exitedPassengers = 0;
  enteredPassengers = 0;
  listTimeToClear = [];
  listMeanTimeToClear = [];
  document.getElementById("time").innerHTML =
    "Current time is " +
    currentTime +
    " seconds or " +
    (currentTime / 60).toFixed(2) +
    " minutes or " +
    (currentTime / 3600).toFixed(2) +
    " hours.";
  document.getElementById("numExited").innerHTML =
    "Number of exited passengers: " + exitedPassengers + ".";
  isPaused = false;
  isRunning = false;
  changeProb();
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
  objects.baggage = [];
  objects.baggageQueue = [];
  createImmigrationOfficers();
  createImmigrationQueues();
  createTestingDoctors();
  createTestingBox();
  createTestingQueues();
  createBaggageArea();
  createBaggageAreaQueue();

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

  var allBaggageAreas = surface.selectAll(".baggageArea").data(objects.baggage);

  var allBaggageAreaQueues = surface
    .selectAll(".baggageAreaQueue")
    .data(objects.baggageQueue);

  allImmigrationOfficers.exit().remove();
  allImmigrationQueues.exit().remove();
  allTestingDoctors.exit().remove();
  allTestingBoxes.exit().remove();
  allBaggageAreas.exit().remove();
  allBaggageAreaQueues.exit().remove();

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

  var newBaggageAreas = allBaggageAreas
    .enter()
    .append("g")
    .attr("class", "baggageArea");

  var newBaggageAreaQueues = allBaggageAreaQueues
    .enter()
    .append("g")
    .attr("class", "baggageAreaQueue");

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
    .attr("width", "50px")
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

  newTestingBoxes
    .append("text")
    .attr("x", function (d) {
      return Number(d.col) + "px";
    })
    .attr("y", function (d) {
      return Number(d.row) + 10 + Number(d.height) + "px";
    })
    .attr("dy", ".35em")
    .text("Waiting Area");

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
    .attr("width", "50px")
    .attr("fill", "transparent")
    .attr("stroke", "palevioletred");

  newBaggageAreas
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
    .attr("stroke", "#4863A0");

  newBaggageAreas
    .append("text")
    .attr("x", function (d) {
      return Number(d.col) + "px";
    })
    .attr("y", function (d) {
      return Number(d.row) + 10 + Number(d.height) + "px";
    })
    .attr("dy", ".35em")
    .text("Baggage Collection");

  newBaggageAreaQueues
    .append("svg")
    .append("rect")
    .attr("x", function (d) {
      return d.col + "px";
    })
    .attr("y", function (d) {
      return d.row + "px";
    })
    .attr("height", "8px")
    .attr("width", "50px")
    .attr("fill", "transparent")
    .attr("stroke", "#4863A0");

  surface.style("font-size", "x-small");

  Plotly.newPlot(
    "tester",
    [
      {
        y: [getData1()],
        mode: "lines",
        line: {
          color: "rebeccapurple",
          width: 1,
        },
      },
    ],
    layout1
  )

  updateSurface();
}

function removeDynamicAgents() {
  let allPassengers = surface.selectAll(".passenger").data(objects.passengers);
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
    document.getElementById("time").innerHTML =
      "Current time is " +
      currentTime +
      " seconds or " +
      (currentTime / 60).toFixed(2) +
      " minutes or " +
      (currentTime / 3600).toFixed(2) +
      " hours.";

    if (enteredPassengers < passengerCount) {
      removeDynamicAgents();
      addDynamicAgents();
      updateDynamicAgents();
    } else if (exitedPassengers < passengerCount) {
      removeDynamicAgents();
      updateDynamicAgents();
    } else {
      isRunning = false;
      isPaused = false;
      clearInterval(simTimer);
      simulationsRan += 1;
      listSimulationRunTime.push(currentTime);
      if (simulationsRan <= simulationRuns) {
        redrawWindow();
        isRunning = true;
        simTimer = window.setInterval(simStep, animationDelay);
        if (isRunning == true) {
          Plotly.extendTraces("simulations", { y: [[getData2()]] }, [0]);
          cnt++;
          if (cnt > limit) {
            Plotly.relayout("simulations", {
              xaxis: {
                range: [cnt - limit, cnt],
              },
            });
          }
        }
      }
    }
  }
}

function clearSimulationsRunTime() {
  simulationsRan = 0;
  listSimulationRunTime = [];
  Plotly.newPlot(
    "simulations",
    [
      {
        y: [getData2()],
        mode: "lines",
        line: {
          color: "palevioletred",
          width: 1,
        },
      },
    ],
    layout1
  );
}

function runSim() {
  let choice1 = document.getElementsByName("choices1")[0].value;
  let choice2 = document.getElementsByName("choices2")[0].value;
  let choice3 = document.getElementsByName("choices3")[0].value;
  isPaused = false;
  changeProb();

  if (choice1 == "none" && choice2 == "none" && choice3 == "none") {
    alert("Please make at least one station choice.");
  } else if (isRunning) {
    alert("Already running.");
  } else if (
    isNaN(probArrival) ||
    isNaN(probCovid) ||
    isNaN(probImmigration) ||
    isNaN(probTesting) ||
    isNaN(probFindBaggage) ||
    isNaN(testingTime) ||
    isNaN(animationDelay) ||
    isNaN(passengerCount) ||
    isNaN(simulationRuns)
  ) {
    alert("At least one of the inputs is not a number.");
  } else {
    isRunning = true;
    simTimer = window.setInterval(simStep, animationDelay);
  }
}

function pause() {
  isRunning = false;
  isPaused = true;
  clearInterval(simTimer);
}

/*

//set dimensions and margins of the graph
var margin = {top:10, right:10, bottom:10, left:10},
  widthg1 = 960 - margin.left - margin.right,
  heightg1 = 540 - margin.top = margin.bottom;

//append the svg object to the body of the page
var svg = d3.select("graph1")
   .append("svg")
     .attr("width", widthg1)
     .attr("height", heightg1)
   .append("g")
     .attr("transform",
           "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scaleLinear().domain([0,50]).range([0,width1 - margin.left - margin.right])
var yScale = d3.scaleLinear().domain([0, 5000]).range([height1 - margin.top - margin.bottom,0])

var line = d3.line().curve(d3.curveMonotoneX)
  .x(function(d){ return xScale(d.x); })
  .y(function(d){ return yScale(d.y); })
 
*/

// set global variables
const limit = 10000; // How many points can be on the graph before sliding occurs
const refreshInterval = 100; // Time between refresh intervals

// set functions to retrieve
function getData1() {
  if (listMeanTimeToClear.length > 0) {
    return listMeanTimeToClear[listMeanTimeToClear.length - 1];
  } else {
    return 0;
  }
}

function getData2() {
  if (listSimulationRunTime.length > 0) {
    return listSimulationRunTime[listSimulationRunTime.length - 1];
  } else {
    return 0;
  }
}
// function getData2() {
// 	return statistics[3].count;
// 	}

// set chart layout
const layout1 = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  xaxis: { title: "Number of passengers", rangemode: "tozero"},
  yaxis: { title: "Average time taken per passenger", rangemode: "tozero"},
  font: {family: "Graphik"}
};

const layout2 = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  xaxis: { title: "Number of simulations", rangemode: "tozero"},
  yaxis: { title: "Average time taken per simulation", rangemode: "tozero"},
  font: {family: "Graphik"}
};

// const layout2 = {
//   paper_bgcolor: 'rgba(0,0,0,0)',
//   plot_bgcolor: 'rgba(0,0,0,0)',
//   xaxis: {title: 'Time'},
//   yaxis: {title: 'R0'}
// };

// plot all charts
Plotly.newPlot(
  "tester",
  [
    {
      y: [getData1()],
      mode: "lines",
      line: {
        color: "rebeccapurple",
        width: 1,
      },
    },
  ],
  layout1
);

Plotly.newPlot(
  "simulations",
  [
    {
      y: [getData2()],
      mode: "lines",
      line: {
        color: "palevioletred",
        width: 1,
      },
    },
  ],
  layout2
);

// Plotly.plot('chart2',[{
// 	y:[getData2()],
// 	mode:'lines',
// 	line: {
// 		color: 'rgb(255,0,0)',
// 		width: 3 }
// }], layout2);

// set refresh interval and graph limit
var cnt = 0;
// setInterval(function () {
//   if (isRunning == true) {
//     Plotly.extendTraces("tester", { y: [[getData1()]] }, [0]);
//     cnt++;
//     if (cnt > limit) {
//       Plotly.relayout("tester", {
//         xaxis: {
//           range: [cnt - limit, cnt],
//         },
//       });
//     }
//   }
// }, refreshInterval);

/*
function ClearPlot(){
  Plotly.newPlot(
  "simulationRuns",
  [
    {
      y: [getData1()],
      mode: "lines",
      line: {
        color: "rebeccapurple",
        width: 1,
      },
    },
  ],
  layout1
);
}*/

redrawWindow();
