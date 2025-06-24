import React, { useState, useEffect, useCallback } from 'react';
// Import the external CSS file
import './style.css';

// Factorial function (helper for Calculator component)
const factorial = (n) => {
    n = parseInt(n);
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let res = 1;
    for (let i = 2; i <= n; i++) {
        res *= i;
    }
    return res;
};

// Main Calculator Component (Apple Style)
const Calculator = () => {
    const [currentInput, setCurrentInput] = useState('0');
    const [firstOperand, setFirstOperand] = useState(null);
    const [operator, setOperator] = useState(null);
    const [awaitingNextOperand, setAwaitingNextOperand] = useState(false);
    const [memory, setMemory] = useState(0);

    // Function to perform basic arithmetic operations
    const operate = (num1, op, num2) => {
        num1 = parseFloat(num1);
        num2 = parseFloat(num2);

        if (isNaN(num1) || isNaN(num2)) {
            return 'Error';
        }

        switch (op) {
            case '+': return num1 + num2;
            case '-': return num1 - num2;
            case '*': return num1 * num2;
            case '/':
                if (num2 === 0) return 'Error: Div by 0';
                return num1 / num2;
            default: return num2;
        }
    };

    // Update the AC/C button text
    const updateClearButton = useCallback(() => {
        const acButton = document.querySelector('[data-value="AC"]');
        if (acButton) {
            if (currentInput !== '0' || firstOperand !== null || operator !== null) {
                acButton.textContent = 'C';
                acButton.dataset.value = 'C';
            } else {
                acButton.textContent = 'AC';
                acButton.dataset.value = 'AC';
            }
        }
    }, [currentInput, firstOperand, operator]);

    useEffect(() => {
        updateClearButton();
    }, [currentInput, firstOperand, operator, updateClearButton]);

    const handleButtonClick = (value) => {
        // Handle Number and Decimal Input
        if (!isNaN(parseFloat(value)) || value === '.') {
            if (awaitingNextOperand) {
                setCurrentInput(value === '.' ? '0.' : value);
                setAwaitingNextOperand(false);
            } else {
                if (value === '.' && currentInput.includes('.')) return;
                if (currentInput === '0' && value !== '.') {
                    setCurrentInput(value);
                } else {
                    setCurrentInput(currentInput + value);
                }
            }
            return;
        }

        // Handle Operator Input (+, -, *, /, =)
        if (['+', '-', '*', '/', '='].includes(value)) {
            if (firstOperand === null) {
                setFirstOperand(parseFloat(currentInput));
            } else if (operator) {
                const result = operate(firstOperand, operator, parseFloat(currentInput));
                if (typeof result === 'string' && result.startsWith('Error')) {
                    setCurrentInput(result);
                    setFirstOperand(null);
                    setOperator(null);
                    setAwaitingNextOperand(false);
                    return;
                }
                setFirstOperand(result);
                setCurrentInput(result.toString());
            }

            setOperator((value === '=') ? null : value);
            setAwaitingNextOperand(true);
            return;
        }

        // Handle Special Functions (AC/C, +/-, %, Scientific, Memory)
        switch (value) {
            case 'AC':
            case 'C':
                setCurrentInput('0');
                setFirstOperand(null);
                setOperator(null);
                setAwaitingNextOperand(false);
                break;

            case '+/-':
                setCurrentInput((parseFloat(currentInput) * -1).toString());
                break;

            case '%':
                if (operator && firstOperand !== null && !awaitingNextOperand) {
                    const percentageValue = parseFloat(currentInput) / 100 * firstOperand;
                    setCurrentInput(percentageValue.toString());
                } else {
                    setCurrentInput((parseFloat(currentInput) / 100).toString());
                }
                break;

            // Scientific Functions
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
            case '!':
            case '^':
                let num = parseFloat(currentInput);
                let calculatedResult = 'Error';
                if (!isNaN(num)) {
                    try {
                        if (value === 'sin') calculatedResult = Math.sin(num * Math.PI / 180);
                        else if (value === 'cos') calculatedResult = Math.cos(num * Math.PI / 180);
                        else if (value === 'tan') calculatedResult = Math.tan(num * Math.PI / 180);
                        else if (value === 'log') {
                            if (num <= 0) calculatedResult = 'Error';
                            else calculatedResult = Math.log10(num);
                        }
                        else if (value === 'ln') {
                            if (num <= 0) calculatedResult = 'Error';
                            else calculatedResult = Math.log(num);
                        }
                        else if (value === 'sqrt') {
                            if (num < 0) calculatedResult = 'Error';
                            else calculatedResult = Math.sqrt(num);
                        }
                        else if (value === '!') calculatedResult = factorial(num);
                        else if (value === '^') calculatedResult = Math.pow(num, 2);
                    } catch (e) {
                        calculatedResult = 'Error';
                    }
                }
                setCurrentInput(calculatedResult.toString());
                setAwaitingNextOperand(true);
                break;

            // Memory Functions
            case 'MC':
                setMemory(0);
                break;
            case 'M+':
                if (!isNaN(parseFloat(currentInput))) {
                    setMemory(prev => prev + parseFloat(currentInput));
                }
                break;
            case 'M-':
                if (!isNaN(parseFloat(currentInput))) {
                    setMemory(prev => prev - parseFloat(currentInput));
                }
                break;
            case 'MR':
                setCurrentInput(memory.toString());
                setAwaitingNextOperand(true);
                break;
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key;
            const keyMap = {
                '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
                '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                '+': '+', '-': '-', '*': '*', '/': '/',
                '.': '.',
                'Enter': '=', '=': '=',
                'Backspace': 'C', 'Delete': 'C',
                'c': 'C', 'C': 'C',
                '%': '%',
                's': 'sin', 'o': 'cos', 't': 'tan',
                'l': 'log', 'n': 'ln', 'q': 'sqrt',
                'f': '!',
                '^': '^',
                'p': '+/-'
            };

            if (keyMap[key]) {
                event.preventDefault();
                handleButtonClick(keyMap[key]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleButtonClick]);

    return (
        <div className="bg-black rounded-2xl w-full max-w-sm p-4 flex flex-col gap-4 shadow-xl">
            <div className="bg-black text-right p-4 pb-2 min-h-[80px] flex items-end justify-end overflow-x-auto whitespace-nowrap">
                <div className="text-white text-5xl font-medium tracking-tight overflow-hidden flex-shrink-0">
                    {currentInput}
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {/* Row 1: Clear, Sign, Percent, Divide */}
                <button className="button bg-gray-400 text-black" onClick={() => handleButtonClick('AC')} data-value="AC">AC</button>
                <button className="button bg-gray-400 text-black" onClick={() => handleButtonClick('+/-')}>+/-</button>
                <button className="button bg-gray-400 text-black" onClick={() => handleButtonClick('%')}>%</button>
                <button className="button bg-orange-500 text-white" onClick={() => handleButtonClick('/')}>÷</button>

                {/* Row 2: 7, 8, 9, Multiply */}
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('7')}>7</button>
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('8')}>8</button>
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('9')}>9</button>
                <button className="button bg-orange-500 text-white" onClick={() => handleButtonClick('*')}>×</button>

                {/* Row 3: 4, 5, 6, Subtract */}
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('4')}>4</button>
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('5')}>5</button>
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('6')}>6</button>
                <button className="button bg-orange-500 text-white" onClick={() => handleButtonClick('-')}>-</button>

                {/* Row 4: 1, 2, 3, Add */}
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('1')}>1</button>
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('2')}>2</button>
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('3')}>3</button>
                <button className="button bg-orange-500 text-white" onClick={() => handleButtonClick('+')}>+</button>

                {/* Row 5: 0, Decimal, Equals (Equals will trigger calculation based on operator) */}
                <button className="col-span-2 rounded-full h-16 bg-gray-700 text-white text-3xl flex items-center justify-start pl-6" onClick={() => handleButtonClick('0')}>0</button>
                <button className="button bg-gray-700 text-white" onClick={() => handleButtonClick('.')}>.</button>
                <button className="button bg-orange-500 text-white" onClick={() => handleButtonClick('=')}>=</button> {/* Equals for visual consistency */}

                {/* Scientific and Memory functions - compact row */}
                <div className="col-span-4 grid grid-cols-4 gap-2 pt-2 border-t border-gray-800 mt-2">
                    <button className="scientific-button" onClick={() => handleButtonClick('sin')}>sin</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('cos')}>cos</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('tan')}>tan</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('log')}>log</button>

                    <button className="scientific-button" onClick={() => handleButtonClick('ln')}>ln</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('^')}>x²</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('sqrt')}>√x</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('!')}>x!</button>

                    <button className="scientific-button" onClick={() => handleButtonClick('MC')}>MC</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('MR')}>MR</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('M+')}>M+</button>
                    <button className="scientific-button" onClick={() => handleButtonClick('M-')}>M-</button>
                </div>
            </div>
        </div>
    );
};

// Date of Birth Calculator Component
const DOBCalculator = () => {
    const [dob, setDob] = useState('');
    const [age, setAge] = useState('');
    const [nextBirthday, setNextBirthday] = useState('');

    const calculateAge = () => {
        if (!dob) {
            setAge('Please enter a valid date.');
            setNextBirthday('');
            return;
        }

        const birthDate = new Date(dob);
        const today = new Date();

        // Calculate age
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in previous month
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        setAge(`${years} years, ${months} months, ${days} days`);

        // Calculate days until next birthday
        let nextBd = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBd < today) {
            nextBd.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = Math.abs(nextBd.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNextBirthday(`${diffDays} days until your next birthday!`);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col gap-4 text-white">
            <h2 className="text-2xl font-bold text-center mb-4">Date of Birth Calculator</h2>
            <div className="flex flex-col gap-2">
                <label htmlFor="dobInput" className="text-lg">Enter your Date of Birth:</label>
                <input
                    type="date"
                    id="dobInput"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <button
                onClick={calculateAge}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                Calculate Age
            </button>
            <div className="mt-4 p-4 bg-gray-700 rounded-md">
                <p className="text-lg">Your Age: <span className="font-semibold">{age}</span></p>
                <p className="text-lg mt-2">Next Birthday: <span className="font-semibold">{nextBirthday}</span></p>
            </div>
        </div>
    );
};

// Currency Converter Component
const CurrencyConverter = () => {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState('');

    // Dummy exchange rates - In a real app, you'd fetch this from an API
    const exchangeRates = {
        USD: { EUR: 0.92, GBP: 0.79, JPY: 158.42, AUD: 1.50, CAD: 1.37, INR: 83.47 },
        EUR: { USD: 1.09, GBP: 0.86, JPY: 172.58, AUD: 1.63, CAD: 1.49, INR: 90.87 },
        GBP: { USD: 1.27, EUR: 1.16, JPY: 200.00, AUD: 1.88, CAD: 1.73, INR: 105.47 },
        JPY: { USD: 0.0063, EUR: 0.0058, GBP: 0.0050, AUD: 0.0095, CAD: 0.0086, INR: 0.52 },
        AUD: { USD: 0.67, EUR: 0.61, GBP: 0.53, JPY: 105.74, CAD: 0.91, INR: 55.72 },
        CAD: { USD: 0.73, EUR: 0.67, GBP: 0.58, JPY: 115.60, AUD: 1.10, INR: 60.85 },
        INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.90, AUD: 0.018, CAD: 0.016 }
    };

    const currencies = Object.keys(exchangeRates);

    const convertCurrency = useCallback(() => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt < 0) {
            setConvertedAmount('Invalid amount');
            return;
        }

        if (fromCurrency === toCurrency) {
            setConvertedAmount(`${amt.toFixed(2)} ${toCurrency}`);
            return;
        }

        const rate = exchangeRates[fromCurrency]?.[toCurrency];
        if (rate) {
            setConvertedAmount(`${(amt * rate).toFixed(2)} ${toCurrency}`);
        } else {
            setConvertedAmount('Conversion not available');
        }
    }, [amount, fromCurrency, toCurrency, exchangeRates]);

    useEffect(() => {
        convertCurrency();
    }, [amount, fromCurrency, toCurrency, convertCurrency]);

    return (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col gap-4 text-white">
            <h2 className="text-2xl font-bold text-center mb-4">Currency Converter</h2>
            <div className="flex flex-col gap-2">
                <label htmlFor="amountInput" className="text-lg">Amount:</label>
                <input
                    type="number"
                    id="amountInput"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                />
            </div>
            <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="fromCurrency" className="text-lg">From:</label>
                    <select
                        id="fromCurrency"
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {currencies.map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="toCurrency" className="text-lg">To:</label>
                    <select
                        id="toCurrency"
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {currencies.map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-4 p-4 bg-gray-700 rounded-md">
                <p className="text-lg">Converted Amount: <span className="font-semibold">{convertedAmount}</span></p>
            </div>
            <p className="text-sm text-gray-400 mt-2">
                Note: Exchange rates are static/dummy values. For real-time rates, a third-party API would be required.
            </p>
        </div>
    );
};

// Generic Unit Converter Component
const UnitConverter = ({ type, units }) => {
    const [value, setValue] = useState('');
    const [fromUnit, setFromUnit] = useState(Object.keys(units)[0]);
    const [toUnit, setToUnit] = useState(Object.keys(units)[1]);
    const [convertedValue, setConvertedValue] = useState('');

    const convert = useCallback(() => {
        const val = parseFloat(value);
        if (isNaN(val)) {
            setConvertedValue('Invalid input');
            return;
        }

        if (fromUnit === toUnit) {
            setConvertedValue(`${val.toFixed(4)} ${units[toUnit].symbol || toUnit}`);
            return;
        }

        let baseValue;
        if (units[fromUnit].toBase) {
            baseValue = units[fromUnit].toBase(val);
        } else {
            baseValue = val * units[fromUnit].multiplier;
        }

        let finalValue;
        if (units[toUnit].fromBase) {
            finalValue = units[toUnit].fromBase(baseValue);
        } else {
            finalValue = baseValue / units[toUnit].multiplier;
        }
        setConvertedValue(`${finalValue.toFixed(4)} ${units[toUnit].symbol || toUnit}`);
    }, [value, fromUnit, toUnit, units]);

    useEffect(() => {
        convert();
    }, [value, fromUnit, toUnit, convert]);

    return (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col gap-4 text-white">
            <h2 className="text-2xl font-bold text-center mb-4">{type} Converter</h2>
            <div className="flex flex-col gap-2">
                <label htmlFor="valueInput" className="text-lg">Value:</label>
                <input
                    type="number"
                    id="valueInput"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter value"
                />
            </div>
            <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="fromUnit" className="text-lg">From:</label>
                    <select
                        id="fromUnit"
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {Object.keys(units).map(unit => (
                            <option key={unit} value={unit}>{units[unit].name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="toUnit" className="text-lg">To:</label>
                    <select
                        id="toUnit"
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {Object.keys(units).map(unit => (
                            <option key={unit} value={unit}>{units[unit].name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-4 p-4 bg-gray-700 rounded-md">
                <p className="text-lg">Converted Value: <span className="font-semibold">{convertedValue}</span></p>
            </div>
        </div>
    );
};

// Unit Definitions for various converters
const unitDefinitions = {
    length: {
        meter: { name: 'Meter', symbol: 'm', multiplier: 1 },
        kilometer: { name: 'Kilometer', symbol: 'km', multiplier: 1000 },
        centimeter: { name: 'Centimeter', symbol: 'cm', multiplier: 0.01 },
        millimeter: { name: 'Millimeter', symbol: 'mm', multiplier: 0.001 },
        mile: { name: 'Mile', symbol: 'mi', multiplier: 1609.34 },
        yard: { name: 'Yard', symbol: 'yd', multiplier: 0.9144 },
        foot: { name: 'Foot', symbol: 'ft', multiplier: 0.3048 },
        inch: { name: 'Inch', symbol: 'in', multiplier: 0.0254 },
    },
    area: {
        square_meter: { name: 'Square Meter', symbol: 'm²', multiplier: 1 },
        square_kilometer: { name: 'Square Kilometer', symbol: 'km²', multiplier: 1e6 },
        square_centimeter: { name: 'Square Centimeter', symbol: 'cm²', multiplier: 1e-4 },
        hectare: { name: 'Hectare', symbol: 'ha', multiplier: 10000 },
        acre: { name: 'Acre', symbol: 'ac', multiplier: 4046.86 },
        square_mile: { name: 'Square Mile', symbol: 'mi²', multiplier: 2.59e6 },
        square_yard: { name: 'Square Yard', symbol: 'yd²', multiplier: 0.836127 },
        square_foot: { name: 'Square Foot', symbol: 'ft²', multiplier: 0.092903 },
        square_inch: { name: 'Square Inch', symbol: 'in²', multiplier: 0.00064516 },
    },
    volume: {
        cubic_meter: { name: 'Cubic Meter', symbol: 'm³', multiplier: 1 },
        cubic_centimeter: { name: 'Cubic Centimeter', symbol: 'cm³', multiplier: 1e-6 },
        liter: { name: 'Liter', symbol: 'L', multiplier: 0.001 },
        milliliter: { name: 'Milliliter', symbol: 'mL', multiplier: 1e-6 },
        gallon_us: { name: 'US Gallon', symbol: 'gal (US)', multiplier: 0.00378541 },
        quart_us: { name: 'US Quart', symbol: 'qt (US)', multiplier: 0.000946353 },
        pint_us: { name: 'US Pint', symbol: 'pt (US)', multiplier: 0.000473176 },
        fluid_ounce_us: { name: 'US Fluid Ounce', symbol: 'fl oz (US)', multiplier: 2.95735e-5 },
        cubic_foot: { name: 'Cubic Foot', symbol: 'ft³', multiplier: 0.0283168 },
        cubic_inch: { name: 'Cubic Inch', symbol: 'in³', multiplier: 1.63871e-5 },
    },
    weight: {
        kilogram: { name: 'Kilogram', symbol: 'kg', multiplier: 1 },
        gram: { name: 'Gram', symbol: 'g', multiplier: 0.001 },
        milligram: { name: 'Milligram', symbol: 'mg', multiplier: 1e-6 },
        pound: { name: 'Pound', symbol: 'lb', multiplier: 0.453592 },
        ounce: { name: 'Ounce', symbol: 'oz', multiplier: 0.0283495 },
        metric_ton: { name: 'Metric Ton', symbol: 't', multiplier: 1000 },
        us_ton: { name: 'US Ton', symbol: 'ton (US)', multiplier: 907.185 },
        stone: { name: 'Stone', symbol: 'st', multiplier: 6.35029 },
    },
    temperature: {
        celsius: {
            name: 'Celsius', symbol: '°C',
            toBase: (c) => c, // Base is Celsius
            fromBase: (c) => c
        },
        fahrenheit: {
            name: 'Fahrenheit', symbol: '°F',
            toBase: (f) => (f - 32) * 5 / 9, // Convert to Celsius
            fromBase: (c) => (c * 9 / 5) + 32
        },
        kelvin: {
            name: 'Kelvin', symbol: 'K',
            toBase: (k) => k - 273.15, // Convert to Celsius
            fromBase: (c) => c + 273.15
        },
    },
    speed: {
        meter_per_second: { name: 'Meter/Second', symbol: 'm/s', multiplier: 1 },
        kilometer_per_hour: { name: 'Kilometer/Hour', symbol: 'km/h', multiplier: 0.277778 },
        mile_per_hour: { name: 'Mile/Hour', symbol: 'mph', multiplier: 0.44704 },
        foot_per_second: { name: 'Foot/Second', symbol: 'ft/s', multiplier: 0.3048 },
        knot: { name: 'Knot', symbol: 'kn', multiplier: 0.514444 },
    },
    pressure: {
        pascal: { name: 'Pascal', symbol: 'Pa', multiplier: 1 },
        kilopascal: { name: 'Kilopascal', symbol: 'kPa', multiplier: 1000 },
        bar: { name: 'Bar', symbol: 'bar', multiplier: 100000 },
        psi: { name: 'Pound-force per sq inch', symbol: 'psi', multiplier: 6894.76 },
        atm: { name: 'Atmosphere', symbol: 'atm', multiplier: 101325 },
        torr: { name: 'Torr', symbol: 'Torr', multiplier: 133.322 },
    },
    power: {
        watt: { name: 'Watt', symbol: 'W', multiplier: 1 },
        kilowatt: { name: 'Kilowatt', symbol: 'kW', multiplier: 1000 },
        megawatt: { name: 'Megawatt', symbol: 'MW', multiplier: 1e6 },
        horsepower: { name: 'Horsepower (metric)', symbol: 'hp (metric)', multiplier: 735.499 },
        horsepower_us: { name: 'Horsepower (US)', symbol: 'hp (US)', multiplier: 745.7 },
        foot_pound_per_minute: { name: 'Foot-pound/minute', symbol: 'ft-lb/min', multiplier: 0.02259696 },
        joule_per_second: { name: 'Joule/second', symbol: 'J/s', multiplier: 1 }, // 1 J/s = 1 W
    }
};

// Main App Component
const App = () => {
    const [currentTool, setCurrentTool] = useState('calculator'); // Default tool

    // Define navigation items
    const navItems = [
        { id: 'calculator', name: 'Calculator' },
        { id: 'dob', name: 'DOB' },
        { id: 'currency', name: 'Currency' },
        { id: 'length', name: 'Length' },
        { id: 'area', name: 'Area' },
        { id: 'volume', name: 'Volume' },
        { id: 'weight', name: 'Weight' },
        { id: 'temperature', name: 'Temp' },
        { id: 'speed', name: 'Speed' },
        { id: 'pressure', name: 'Pressure' },
        { id: 'power', name: 'Power' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-900 text-white font-inter">
            {/* Sidebar / Navigation */}
            <nav className="w-full md:w-64 bg-gray-950 p-4 md:p-6 flex flex-row md:flex-col items-center md:items-start overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-gray-700">
                <h1 className="text-3xl font-bold mb-4 whitespace-nowrap md:text-center md:w-full hidden md:block">Super Calc</h1>
                <div className="flex flex-row md:flex-col gap-2 md:gap-3 w-full">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap
                                ${currentTool === item.id ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                            onClick={() => setCurrentTool(item.id)}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
                {currentTool === 'calculator' && <Calculator />}
                {currentTool === 'dob' && <DOBCalculator />}
                {currentTool === 'currency' && <CurrencyConverter />}
                {currentTool === 'length' && <UnitConverter type="Length" units={unitDefinitions.length} />}
                {currentTool === 'area' && <UnitConverter type="Area" units={unitDefinitions.area} />}
                {currentTool === 'volume' && <UnitConverter type="Volume" units={unitDefinitions.volume} />}
                {currentTool === 'weight' && <UnitConverter type="Weight" units={unitDefinitions.weight} />}
                {currentTool === 'temperature' && <UnitConverter type="Temperature" units={unitDefinitions.temperature} />}
                {currentTool === 'speed' && <UnitConverter type="Speed" units={unitDefinitions.speed} />}
                {currentTool === 'pressure' && <UnitConverter type="Pressure" units={unitDefinitions.pressure} />}
                {currentTool === 'power' && <UnitConverter type="Power" units={unitDefinitions.power} />}
            </main>
        </div>
    );
};

export default App;

