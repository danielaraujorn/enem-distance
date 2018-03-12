var ga = require("darwin-js");
var fetch = require("node-fetch");
var express = require("express")();
var bodyParser = require("body-parser");
var path = require("path");
var bestOne;
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
  { name: "sayonara", lat: -5.849708, lng: -35.203186 },
  { name: "patricio", lat: -5.821139, lng: -35.215744 },
  { name: "fire", lat: -5.8259, lng: -35.220698 },
  { name: "wesley", lat: -5.828765, lng: -35.219058 },
  { name: "pedro", lat: -5.830514, lng: -35.20227 },
  { name: "amanda", lat: -5.850647, lng: -35.201349 },
  { name: "dione", lat: -5.861826, lng: -35.201376 }
];

let escolas = [
  { name: "sebrae", lat: -5.825073, lng: -35.21151, capacidade: 5 },
  { name: "hipocrates", lat: -5.846136, lng: -35.21281, capacidade: 5 },
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
    .then(body => {
      callback(JSON.parse(body).rows[0].elements[0].distance.value);
    });
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
getIndividual = (key, population) => {
  const sumFit = population.map(item => item.fitness).reduce((a, b) => a + b);
  const vRoullete = population.map(item => {
    return { fitness: item.fitness / sumFit };
  });
  let sum = 0;
  for (let i = 0; i < vRoullete.length; i++) {
    vRoullete[i].min = sum;
    vRoullete[i].max = sum + vRoullete[i].fitness;
    sum += vRoullete[i].fitness;
  }
  return population[
    vRoullete.findIndex(item => key > item.min && key <= item.max)
  ].individual;
  // v.forEach(individual => {
  //   if (
  //     Math.min(individual.relativeBoundaries.max, key) ==
  //     Math.max(individual.relativeBoundaries.min, key)
  //   ) {
  //     return individual;
  //   }
  // });
};
// console.log(generateRandomCombination());
// Implement on your own
var myPopulation = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() =>
  generateRandomCombination()
);
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
    // console.log(
    //   individual,
    //   individual
    //     .map(item => distancias[item.pessoa][item.escola])
    //     .reduce((prev, item) => prev + item)
    // );
    return new Promise((resolve, reject) => {
      resolve(
        10000000 /
          individual
            .map(item => distancias[item.pessoa][item.escola])
            .reduce((prev, item) => prev + item)
      );
    });
  },
  selection: population => getIndividual(Math.random(), population),
  crossover: (parent1, parent2) => {
    // console.log("1", parent1, "2", parent2, "\n");
    return [crossover(parent1, parent2), crossover(parent1, parent2)];
  },
  mutation: individual => generateRandomCombination(),
  iterations: 10000,
  stop: fitness => {
    // Return true if fitness is high enough. Will
    // terminate G.A. even if it hasn't iterated 10000 times.
    return false;
  },
  stats: (fitnesses, best) => {
    // console.log(
    //   "Fitnesses of current generation: " +
    //     10000000 / fitnesses.reduce((prev, item) => prev + item) +
    //     "\n"
    // );
    // console.log(fitnesses, "\n");
    // console.log("Best performing individual: %j", best);
  }
};

// Run genetic algorithm

setTimeout(() => {
  ga
    .run(options)
    .then(result => {
      bestOne = result.best.individual.map(item => {
        return {
          pessoa: pessoas[item.pessoa],
          escola: escolas[item.escola],
          escolaIndex: item.escola
        };
      });
      console.log("Best individual's fitness: " + result.best.fitness);
      console.log("Best individual: " + JSON.stringify(result.best.individual));
      // console.log("Last population: %j", result.population);
    })
    .catch(err => {
      console.log("Oops: " + err);
    });
}, 4000);

const crossover = (parent1, parent2) => {
  // console.log("crossover in", parent1, "\n", parent2, "\n");

  let capacidades = escolas.map((item, i) => item.capacidade);
  const findSchollCapacity = item => {
    if (capacidades[item.escola]) {
      return item;
      capacidades[item.escola] = capacidades[item.escola] - 1;
    } else {
      let newSchool = capacidades.findIndex(i => i > 0);
      capacidades[newSchool] = capacidades[newSchool] - 1;
      return Object.assign({}, item, {
        escola: newSchool
      });
    }
  };
  let parent2Copy = parent2.sort(function(a, b) {
    return a.pessoa - b.pessoa;
  });
  return parent1
    .sort(function(a, b) {
      return a.pessoa - b.pessoa;
    })
    .map((item, i) => {
      // console.log(item, parent2Copy[i]);
      if (
        distancias[item.pessoa][item.escola] >
        distancias[parent2Copy[i].pessoa][parent2Copy[i].escola]
      )
        return findSchollCapacity(item);
      return findSchollCapacity(parent2Copy[i]);
    });
};

express.use(bodyParser());
express.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});
express.get("/getBest", (req, res) => {
  console.log("olha ai, chegou");
  res.setHeader("Content-Type", "application/json");
  res.json(bestOne);
});
express.listen(3001, () => console.log("subiu o server"));
