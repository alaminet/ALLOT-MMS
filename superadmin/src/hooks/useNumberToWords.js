const useNumberToWords = (number) => {
  // Input validation
  if (number === undefined || number === null) {
    return "";
  }

  // Convert to number if string is passed
  const num = typeof number === "string" ? parseFloat(number) : number;

  // Return empty if not a valid number
  if (isNaN(num)) {
    return "";
  }

  function numberToWords(num) {
    if (num === 0) return "zero";

    const belowTwenty = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const thousands = ["", "thousand", "million", "billion", "trillion"];

    function helper(n) {
      if (n === 0) return "";
      else if (n < 20) return belowTwenty[n] + " ";
      else if (n < 100) {
        const remainder = n % 10;
        return (
          tens[Math.floor(n / 10)] +
          (remainder > 0 ? "-" + belowTwenty[remainder] : "") +
          " "
        );
      } else {
        return belowTwenty[Math.floor(n / 100)] + " hundred " + helper(n % 100);
      }
    }

    // Handle negative numbers
    if (num < 0) {
      return "negative " + numberToWords(Math.abs(num));
    }

    // Handle decimals
    let [integerPart, decimalPart] = num.toString().split(".");
    let intNum = parseInt(integerPart, 10);

    let res = "";
    let i = 0;
    while (intNum > 0) {
      if (intNum % 1000 !== 0) {
        res = helper(intNum % 1000) + thousands[i] + " " + res;
      }
      intNum = Math.floor(intNum / 1000);
      i++;
    }

    res = res.trim();

    // Handle decimal points
    if (decimalPart) {
      const decimalWords = decimalPart
        .split("")
        .map((digit) => belowTwenty[parseInt(digit, 10)])
        .join(" ");
      res += " point " + decimalWords;
    }

    return res.trim();
  }

  return numberToWords(num);
};

export default useNumberToWords;
