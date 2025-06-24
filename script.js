// script.js

const expressionDisplay = document.getElementById('expression-display');
const resultDisplay = document.getElementById('result-display');
const buttons = document.querySelectorAll('.button');

let currentExpression = '';
let memory = 0;
let newCalculation = false; // Flag to indicate if a new calculation should start

// Function to handle factorial calculation
function factorial(n) {
    if (n < 0) return NaN; // Factorial not defined for negative numbers
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; // Prevent overflow for very large numbers
    let res = 1;
    for (let i = 2; i <= n; i++) {
        res *= i;
    }
    return res;
}

// Function to safely evaluate expressions (with caveats for eval())
function evaluateExpression() {
    try {
        // Replace custom function notations with Math object methods
        let expression = currentExpression
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(') // Common log (base 10)
            .replace(/ln\(/g, 'Math.log(')   // Natural log (base e)
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**'); // For power operator (x^y)

        // Handle percentage: e.g., 50% of 200 -> 200 * (50/100)
        // This is a simplified handling. A true percentage would be context-aware.
        // For now, it will convert `number%` to `number/100` if followed by an operator or end of expression.
        expression = expression.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

        // Handle factorial '!'
        // This is tricky with eval. A proper parser would handle it.
        // For now, if '!' is at the end of a number, we'll try to process it.
        // This won't work for expressions like (5+3)!
        expression = expression.replace(/(\d+)!/g, (match, p1) => `factorial(${p1})`);
        // We need to add 'factorial' function to global scope for eval to find it
        window.factorial = factorial;

        // Evaluate the expression
        let evalResult = eval(expression);

        // Handle division by zero
        if (evalResult === Infinity || evalResult === -Infinity) {
            return 'Division by Zero';
        }
        // Handle NaN results (e.g., sqrt of negative number)
        if (isNaN(evalResult)) {
            return 'Error';
        }

        return evalResult;
    } catch (e) {
        return 'Error';
    }
}

// Attach event listeners to all buttons
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;

        if (newCalculation && !['=', 'C', 'backspace', 'MR', 'M+', 'M-'].includes(value)) {
            // If it's a new calculation and a number/operator/function is pressed, start fresh
            // But if it's an operator after an equals, allow chaining
            if (!isNaN(parseFloat(value)) || value === '(' || value === ')' || value.match(/[a-zA-Z]/)) {
                currentExpression = '';
            } else if (['+', '-', '*', '/', '^'].includes(value)) {
                 // Allow chaining operators if the previous result is a number
                if (!isNaN(parseFloat(resultDisplay.textContent))) {
                    currentExpression = resultDisplay.textContent;
                } else {
                    currentExpression = ''; // Clear if previous result was error/non-numeric
                }
            } else if (value === '.') {
                if (resultDisplay.textContent === 'Error') {
                     currentExpression = '0';
                } else {
                    currentExpression = resultDisplay.textContent + '.';
                }
            }
            newCalculation = false;
        }

        switch (value) {
            case 'C':
                currentExpression = '';
                resultDisplay.textContent = '0';
                expressionDisplay.textContent = '';
                newCalculation = false;
                break;
            case 'backspace':
                currentExpression = currentExpression.slice(0, -1);
                expressionDisplay.textContent = currentExpression;
                if (currentExpression === '') {
                    resultDisplay.textContent = '0';
                }
                newCalculation = false;
                break;
            case '=':
                if (currentExpression === '') {
                    resultDisplay.textContent = '0';
                    break;
                }
                const result = evaluateExpression();
                resultDisplay.textContent = result;
                expressionDisplay.textContent = currentExpression + '=';
                currentExpression = result.toString(); // Set current expression to result for chaining
                newCalculation = true; // Flag for new calculation to start
                break;
            case 'M+':
                try {
                    memory += parseFloat(resultDisplay.textContent);
                    expressionDisplay.textContent = `Memory: ${memory.toFixed(2)}`; // Display memory for a moment
                    setTimeout(() => expressionDisplay.textContent = currentExpression, 1000);
                } catch (e) {
                    expressionDisplay.textContent = 'Error M+';
                }
                newCalculation = false;
                break;
            case 'M-':
                try {
                    memory -= parseFloat(resultDisplay.textContent);
                    expressionDisplay.textContent = `Memory: ${memory.toFixed(2)}`;
                    setTimeout(() => expressionDisplay.textContent = currentExpression, 1000);
                } catch (e) {
                    expressionDisplay.textContent = 'Error M-';
                }
                newCalculation = false;
                break;
            case 'MR':
                currentExpression = memory.toString();
                resultDisplay.textContent = memory.toString();
                expressionDisplay.textContent = currentExpression;
                newCalculation = false;
                break;
            case 'MC':
                memory = 0;
                expressionDisplay.textContent = `Memory Cleared`;
                setTimeout(() => expressionDisplay.textContent = currentExpression, 1000);
                newCalculation = false;
                break;
            default:
                // If the last result was an error, clear and start new input
                if (resultDisplay.textContent === 'Error' || resultDisplay.textContent === 'Division by Zero') {
                    currentExpression = '';
                }

                // Prevent multiple decimals in a number
                const lastChar = currentExpression.slice(-1);
                if (value === '.' && (lastChar === '.' || ['+', '-', '*', '/', '(', '^'].includes(lastChar) || currentExpression === '')) {
                     // Prevents ".." or "2+." etc. or leading "."
                     if (currentExpression === '') { // Allows leading ".5" -> "0.5"
                         currentExpression += '0.';
                     } else if (/[0-9]/.test(lastChar)) { // Allows "2.3"
                         currentExpression += value;
                     }
                     // Else, do nothing if it's an invalid placement
                } else if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt('].includes(value)) {
                    // Automatically append an opening parenthesis for functions
                    currentExpression += value;
                }
                else {
                    currentExpression += value;
                }
                expressionDisplay.textContent = currentExpression;
                newCalculation = false;
                break;
        }

        // Keep the result display at 0 if expression is empty, unless it's a memory recall
        if (currentExpression === '' && value !== 'MR' && !newCalculation) {
            resultDisplay.textContent = '0';
        }
    });
});

// Optional: Add keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Map keyboard keys to calculator button values
    const keyMap = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '+': '+', '-': '-', '*': '*', '/': '/',
        '.': '.', 'Enter': '=', '=': '=', // Both Enter and = for equals
        'Backspace': 'backspace', 'Delete': 'C',
        '(': '(', ')': ')', '%': '%', '^': '^' // For x^y
        // Add more mappings for scientific functions if desired (e.g., 's' for sin, 'c' for cos)
    };

    if (keyMap[key]) {
        event.preventDefault(); // Prevent default browser actions for some keys
        const button = document.querySelector(`.button[data-value="${keyMap[key]}"]`);
        if (button) {
            button.click(); // Simulate a click on the corresponding button
        }
    } else if (key === 'p' || key === 'P') { // Custom key for Pi
        event.preventDefault();
        const piButton = document.querySelector('.button[data-value="Math.PI"]');
        if (piButton) piButton.click();
    } else if (key === 'e' || key === 'E') { // Custom key for Euler's number
        event.preventDefault();
        const eButton = document.querySelector('.button[data-value="Math.E"]');
        if (eButton) eButton.click();
    }
});
