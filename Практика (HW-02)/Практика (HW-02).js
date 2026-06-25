// Задание 7.1: Метод call

console.log("--- Задание 7.1 ---");

const person = {
    name: "Alex",
    age: 28
};
function printInfo() {
    console.log(`Name: ${this.name}, Age: ${this.age}`);
}

printInfo.call(person);


// Задание 7.2: Метод apply

console.log("\n--- Задание 7.2 ---");

function calculate(a, b, operator) {
    switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: return "Неизвестный оператор";
    }
}

const mathContext = { a: 2, b: 3, operator: "+" };
const args = [2, 3, "+"];

const calcResult = calculate.apply(mathContext, args);
console.log(`Результат операции: ${calcResult}`);


// Задание 7.3: Фильтрация и трансформация массива

console.log("\n--- Задание 7.3 ---");

const users = [
    { name: "Анна", age: 16 },
    { name: "Иван", age: 22 },
    { name: "Мария", age: 18 },
    { name: "Петр", age: 15 }
];

const adults = users.filter(user => user.age >= 18);
console.log("Совершеннолетние пользователи:", adults);

const adultsNames = adults.map(user => user.name);
console.log("Имена совершеннолетних:", adultsNames);


// Задание 7.4: Метод bind
console.log("\n--- Задание 7.4 ---");

function setFullName(fullName) {
    this.fullName = fullName;
}

const setPersonFullName = setFullName.bind(person);

setPersonFullName("John Smith");

console.log("Обновленный объект person:", person);


// Задание 7.5: Уникальные числа по возрастанию

console.log("\n--- Задание 7.5 ---");

function getUniqueSortedNumbers(numbers) {

    const uniqueNumbers = [...new Set(numbers)];


    uniqueNumbers.sort((a, b) => a - b);

    return uniqueNumbers;
}

const rawNumbers = [5, 2, 9, 1, 5, 8, 2, 10, 1];
const resultArr = getUniqueSortedNumbers(rawNumbers);

console.log("Исходный массив:", rawNumbers);
console.log("Уникальный и отсортированный:", resultArr);