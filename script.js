const display = document.querySelector("#display");
const keypad = document.querySelector(".keypad");
const themeTrack = document.querySelector(".theme-track");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let justCalculated = false;

function formatDisplay(value) {
  if (value === "Error") return value;
  const [integer, decimal] = value.split(".");
  const sign = integer.startsWith("-") ? "-" : "";
  const unsignedInteger = sign ? integer.slice(1) : integer;
  const formattedInteger = Number(unsignedInteger || 0).toLocaleString("en-US", {
    maximumFractionDigits: 12,
    useGrouping: true
  });
  return `${sign}${formattedInteger}${decimal !== undefined ? `.${decimal}` : ""}`;
}

function updateDisplay() {
  display.textContent = formatDisplay(currentValue);
}

function resetCalculator() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  justCalculated = false;
  updateDisplay();
}

function inputNumber(value) {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    currentValue = value;
    waitingForOperand = false;
    justCalculated = false;
  } else {
    currentValue = currentValue === "0" ? value : `${currentValue}${value}`;
  }
  updateDisplay();
}

function inputDecimal() {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    currentValue = "0.";
    waitingForOperand = false;
    justCalculated = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

function calculate(left, right, operator) {
  const first = Number(left);
  const second = Number(right);
  let result;

  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  if (operator === "+") result = first + second;
  if (operator === "-") result = first - second;
  if (operator === "*") result = first * second;
  if (operator === "/") {
    if (second === 0) return null;
    result = first / second;
  }
  if (!Number.isFinite(result)) return null;
  return Number(result.toPrecision(12)).toString();
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;
  if (pendingOperator && storedValue !== null && !waitingForOperand) {
    const result = calculate(storedValue, currentValue, pendingOperator);
    if (result === null) {
      currentValue = "Error";
      storedValue = null;
      pendingOperator = null;
      updateDisplay();
      return;
    }
    currentValue = result;
    storedValue = result;
  } else {
    storedValue = currentValue;
  }
  pendingOperator = operator;
  waitingForOperand = true;
  justCalculated = false;
  updateDisplay();
}

function calculateResult() {
  if (!pendingOperator || storedValue === null || currentValue === "Error") return;
  const result = calculate(storedValue, currentValue, pendingOperator);
  currentValue = result === null ? "Error" : result;
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  justCalculated = true;
  updateDisplay();
}

function deleteLast() {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    currentValue = "0";
    waitingForOperand = false;
    justCalculated = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
    if (currentValue === "-") currentValue = "0";
  }
  updateDisplay();
}

function handleAction(action, value) {
  if (action === "number") inputNumber(value);
  if (action === "decimal") inputDecimal();
  if (action === "operator") chooseOperator(value);
  if (action === "equals") calculateResult();
  if (action === "delete") deleteLast();
  if (action === "reset") resetCalculator();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  const { key } = event;
  if (/^\d$/.test(key)) handleAction("number", key);
  else if (key === ".") handleAction("decimal");
  else if (["+", "-", "*", "/"].includes(key)) handleAction("operator", key);
  else if (key === "Enter" || key === "=") handleAction("equals");
  else if (key === "Backspace") handleAction("delete");
  else if (key === "Escape") handleAction("reset");
});

themeTrack.addEventListener("click", () => {
  themeTrack.classList.toggle("is-second-theme");
});
