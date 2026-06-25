
// Задание 6.1: Проверка на палиндром
console.log("--- Задание 6.1 ---");

function checkPalindrome(word) {

    const cleanWord = word.toLowerCase().replace(/\s+/g, '');

    const reversedWord = cleanWord.split('').reverse().join('');

    if (cleanWord === reversedWord) {
        console.log(`Слово ${word} является палиндромом`);
    } else {
        console.log(`Слово ${word} не является палиндромом`);
    }
}

// Проверка примеров
checkPalindrome("Довод");
checkPalindrome("Сантимент");


// Задание 6.2: Уникальные значения из массива
console.log("\n--- Задание 6.2 ---");

const arr = [1, 2, 3, 1, 5, 4, 2, 3, 5, 'they', 'don\'t', 'know', 'that', 'we', 'know', 'that', 'they', 'know'];

const uniqueArr = [...new Set(arr)];

console.log(uniqueArr);


// Задание 6.3: Создание массива от 0 до введенного числа
console.log("\n--- Задание 6.3 ---");

const userInput = prompt("Введите любое целое число:");
const targetNumber = Number(userInput);

if (!isNaN(targetNumber) && targetNumber >= 0) {
    const numbersArray = [];

    for (let i = 0; i <= targetNumber; i++) {
        numbersArray.push(i);
    }

    console.log(numbersArray);
} else {
    console.log("Пожалуйста, введите корректное положительное число.");
}


// Задание 6.4: Поле для игры «Крестики-нолики»
console.log("\n--- Задание 6.4 ---");

const size = 3;
for (let i = 0; i < size; i++) {
    let row = "";
    for (let j = 0; j < size; j++) {
        row += (i + j) % 2 === 0 ? "x " : "o ";
    }
    console.log(row.trim());
}


// Задание 6.5: Плоский массив из значений объекта
console.log("\n--- Задание 6.5 ---");

const obj = {
    some: 'some',
    dom: 'text',
    arr: [1, 2, 3, 4, 5],
    tom: 'there'
};

const arrValues = [];


for (let key in obj) {
    if (Array.isArray(obj[key])) {
        arrValues.push(...obj[key]);
    } else {
        arrValues.push(obj[key]);
    }
}

console.log(arrValues);