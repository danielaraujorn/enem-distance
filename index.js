const {Algorithm, Operators} = require('microverse');
const {Crossovers, Selectors} = Operators;

let alunos=[
	{name:"daniel",lat:5,lng:5},
	{name:"ricardo",lat:5,lng:5},
	{name:"judson",lat:5,lng:5},
	{name:"iran",lat:5,lng:5},
	{name:"leonardo",lat:5,lng:5},
	{name:"diego",lat:5,lng:5},
	{name:"marcelo",lat:5,lng:5},
	{name:"dani",lat:5,lng:5},
	{name:"marconi",lat:5,lng:5},
	{name:"sayonara",lat:5,lng:5},
	{name:"amanda",lat:5,lng:5},
]
 
let escolas=[
	{name:"cei",lat:5,lng:5},
	{name:"hipocrates",lat:5,lng:5},
	{name:"ufrn",lat:5,lng:5},
]
  
let population = [];
    
//Generate a random population somehow 
for (let i = 0; i < 5; i++) {
    let chromosome = {pessoa:Math.floor(Math.random()*alunos.length),escola:Math.floor(Math.random()*escolas.length)};
    population.push(chromosome);
}
    
let alg = new Algorithm({population});
    
//Subscribe to events 
alg.on('evaluation', info => console.log(info));
alg.on('selection', info =>  console.log(info));
alg.on('crossover', info =>  console.log(info));
alg.on('generation', info =>  console.log(info));
alg.on('end', info =>  console.log(info));
    
//Run the algorithm indefinitely or until the criteria has met 
alg.run().then(info =>  console.log(info));
    
//Run the algorithm for 100 iterations or until the criteria has met 
alg.run(100).then(info =>  console.log(info));
    
//Pipe the progress (will stream json string 'generation' events) 
alg.pipe(process.stdout); 
