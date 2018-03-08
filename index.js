var ga = require("darwin-js");
var fetch = require("node-fetch");

let pessoas = [
  { name: "daniel", lat: -5.846827, lng: -35.210825 },
  { name: "ricardo", lat: -5.826471, lng: -35.208077 },
  { name: "judson", lat: -5.832787, lng: -35.211044 },
  { name: "iran", lat: -5.833676, lng: -35.209336 },
  { name: "leonardo", lat: -5.835467, lng: -35.209528 },
  { name: "diego", lat: -5.838261, lng: -35.212255 },
  { name: "marcelo", lat: -5.840823, lng: -35.214047 },
  { name: "dani", lat: -5.844085, lng: -35.214852 },
  { name: "marconi", lat: -5.846814, lng: -35.21472 },
  { name: "sayonara", lat: -5.849708, lng: -35.203186 }
];

let escolas = [
  { name: "sebrae", lat: -5.825073, lng: -35.21151, capacidade: 2 },
  { name: "hipocrates", lat: -5.846136, lng: -35.21281, capacidade: 1 },
  { name: "ufrn", lat: -5.839371, lng: -35.200773, capacidade: 10 }
];

const distancias = Array(pessoas.length)
  .fill(0)
  .map(x => Array(escolas.length).fill(Infinity));

const calcularDistancia = (pessoa, escola, callback) => {
  fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
      pessoa.lat
    },${pessoa.lng}&destinations=${escola.lat},${
      escola.lng
    }&key=AIzaSyBcMFCfbdJdD3__pdiZWMU9Ab5PS2N-pYo`
  )
    .then(res => res.text())
    .then(body =>
      callback(JSON.parse(body).rows[0].elements[0].distance.value)
    );
};
const calcularDistancias = () =>
  pessoas.forEach((pessoa, i) =>
    escolas.forEach((escola, j) =>
      calcularDistancia(pessoa, escola, retorno => {
        distancias[i][j] = retorno;
      })
    )
  );
calcularDistancias();
//Generate a random population somehow
const generatePersonSchool = array => {
  let numero = Math.floor(Math.random() * array.length);
  //   console.log(array[numero]);
  return array[numero];
};
const generateRandomCombination = () => {
  let pessoasCopy = [...pessoas].map((item, indice) =>
    Object.assign({}, item, { indice })
  );
  let escolasCopy = [...escolas].map((item, indice) =>
    Object.assign({}, item, { indice })
  );
  //   console.log(escolasCopy);
  //   console.log(pessoasCopy, escolasCopy);
  return [
    ...pessoas.map(item => {
      let pessoa = generatePersonSchool(pessoasCopy).indice;
      let escola = generatePersonSchool(escolasCopy).indice;
      pessoasCopy = pessoasCopy.filter(item => item.indice !== pessoa);
      escolasCopy = escolasCopy
        .map(item => {
          if (item.indice === escola) {
            return Object.assign({}, item, { capacidade: item.capacidade - 1 });
          } else return item;
        })
        .filter(item => item.capacidade > 0);
      return {
        pessoa: pessoa,
        escola: escola
      };
    })
  ];
};

const traduzir = array =>
  array.map(item => {
    return {
      pessoa: pessoas[item.pessoa].name,
      escola: escolas[item.escola].name
    };
  });

// console.log(generateRandomCombination());
// Implement on your own
var myPopulation = [1, 2, 3, 4].map(() => generateRandomCombination());
var options = {
  // Always copy over best individual without modification
  // to the next generation.
  elitist: true,
  population: myPopulation,
  fitness: individual => {
    // You have the option of returning a Promise here, if
    // G.A. needs to asynchronously reach out to the user, say, for a
    // subjective rating.
    // console.log(
    //   individual
    //     .map(item => distancias[item.pessoa][item.escola])
    //     .reduce((prev, item) => prev + item)
    // );
    return (
      1000000 /
      individual
        .map(item => distancias[item.pessoa][item.escola])
        .reduce((prev, item) => prev + item)
    );
  },
  selection: population => {
    // Return an individual population[k].individual based on
    // population[k].fitness.
    // var k = ...
    let biggerN = 0;
    let biggerI = 0;
    for (let i = 0; i < population.length; i++) {
      if (population[i].fitness > biggerN) {
        biggerN = population[i].fitness;
        biggerI = i;
      }
    }
    return population[biggerI].individual;
  },
  crossover: (parent1, parent2) => {
    // Combine parent1 and parent2 somehow
    return [child1, child2];
  },
  mutation: individual => {
    let individualCopy = individual;
    let indice1 = Math.floor(Math.random() * individual.length);
    let indice2 = Math.floor(Math.random() * individual.length);
    while (indice1 === indice2) {
      indice2 = Math.floor(Math.random() * individual.length);
    }
    [individualCopy[indice1].pessoa, individualCopy[indice2].pessoa] = [
      individualCopy[indice2].pessoa,
      individualCopy[indice1].pessoa
    ];
    // Mutate individual (or return unchanged)
    // ...
    return individualCopy;
  },
  iterations: 100000,
  stop: fitness => {
    // Return true if fitness is high enough. Will
    // terminate G.A. even if it hasn't iterated 10000 times.
    return false;
  },
  stats: (fitnesses, best) => {
    console.log("Fitnesses of current generation: " + fitnesses);
    console.log("Best performing individual: %j", best);
  }
};

// Run genetic algorithm

setTimeout(() => {
  ga
    .run(options)
    .then(result => {
      //   console.log("Best individual: " + result.best.individual);
      //   console.log("Best individual's fitness: " + result.best.fitness);
      //   console.log("Last population: %j", result.population);
    })
    .catch(err => {
      console.log("Oops: " + err);
    });
  //   console.log(
  //     myPopulation[0].map(item => {
  //       return {
  //         pessoa: item.pessoa,
  //         escola: item.escola,
  //         distancia: distancias[item.pessoa][item.escola]
  //       };
  //     }),
  //     " ",
  //     myPopulation[1].map(item => {
  //       return {
  //         pessoa: item.pessoa,
  //         escola: item.escola,
  //         distancia: distancias[item.pessoa][item.escola]
  //       };
  //     })
  //   );
}, 5000);
