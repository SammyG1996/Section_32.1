const express = require('express');
// This is the error class that was created by extending off JS errors class
const ExpressError = require('./expressError')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This class allows you to calculate the different necessary functions and then return
class Calculate {
  constructor(method, nums) {
    this.method = method;
    this.nums = nums;
  }

  // This will extract the numbers from the string thats passed in from express
  extractNums(){
    const exampleOfNumsArr = ['0','1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const tempArr = [];
    let tempIntHolder = '';

    if(!this.nums){
      throw new ExpressError('Nums are required please', 400)
    }

    for(let num of this.nums){
      if(num === ','){
        tempArr.push(parseInt(tempIntHolder));
        tempIntHolder = '';

      } else{
        
        if(exampleOfNumsArr.includes(num)){
          tempIntHolder = tempIntHolder + num
        }
        else{
          throw new ExpressError(`${num} is not a number`, 400);
        } 
      }
      
    }

    tempIntHolder !== '' ? tempArr.push(parseInt(tempIntHolder)) : null;
    return tempArr
  }

  // This will sum all the numbers together
  sumNums(nums){
    return nums.reduce((prevVal, currVal) => prevVal + currVal, 0)
  }

  // This is a template to create the return object
  createObj(operation, value){
    const obj = {
        operation : operation, 
        value: value
    }
    return obj
  }

  // This will calculate the mean
  getMean(){
    const numsArr = this.extractNums();
    const sum = this.sumNums(numsArr);
    const divisor = numsArr.length;
    const mean = sum / divisor

    const obj = this.createObj('mean', mean)
    return obj
  }

  // This will calculate the median. 
  getMedian(){
    const numsArr = this.extractNums();
    const arrLength = numsArr.length;
    let median; 

    if(arrLength % 2 !== 0){
      median = numsArr[(arrLength - 1) / 2];
    } else {
      const med1 = numsArr[arrLength / 2];
      const med2 = numsArr[(arrLength / 2) - 1];
      median = (med1 + med2) / 2;
    }

    const obj = this.createObj('median', median);
    return obj
  }

  // This will calculate and return the mode
  getMode(){
    const arr = this.extractNums();
    const count = {};

    for (const element of arr) {
      count[element] ? count[element] += 1 : count[element] = 1;
    }

    let winner = null;

    for(let [key, val] of Object.entries(count)){
      if(!winner){
        winner = {
          key: key, 
          val: val
        }
      } else {
        val > winner.val ? (winner.key = key) && (winner.val = val) : null
      }
    }

    winner.val === 1 ? winner = null : null;

    if(winner){
      return this.createObj('mode', winner.key)
    }
    else{
      return this.createObj('mode', null)
    }

  }
}

// This is the default homepage
app.get('/', (req, res) =>{
  return res.send('Homepage');
})

// This route will get you the mean
app.get('/mean', (req,res,next) => {
  const c = new Calculate('mean', req.query.nums);
  let mean;
  try{
    mean = c.getMean();
  } catch(err){
    next(err)
  }
  
  return res.json({response: mean});
})

// This will get the median
app.get('/median', (req, res, next) => {
  const c = new Calculate('median', req.query.nums);
  let median;
  try{
    median = c.getMedian();
  } catch(err){
    next(err)
  }
  return res.json({response : median})
})

// This route will get you the mode
app.get('/mode', (req, res, next) => {
  const c = new Calculate('mode', req.query.nums);
  let mode;
  try{
    mode = c.getMode();
  } catch(err){
    next(err)
  }
  return res.json({response : mode})
})

// This is used for error handeling and will send the error message that was created in JSON
app.use(function(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  return res.status(status).json({
    error: {message, status}
  });
});

app.listen(3000, (err)=> {
  if(err){
    console.log(err);
  }
})