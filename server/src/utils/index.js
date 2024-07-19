exports.getRandomNumbers = () => {
    let numbers = '';
  
    for (let i = 0; i < 6; i++) {
      let number = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
  
      numbers += number
    }
  
    return numbers;
  }