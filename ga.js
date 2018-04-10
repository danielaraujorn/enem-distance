var { User, Local, Distance } = require("./model.js");
var options = require("./options.js");
var ga = require("darwin-js");
let pessoas = false;
var fetch = require("node-fetch");
let escolas = false;
var myPopulation = new Array(options.tamanhoPopulacao).fill(0);

var distancias = Array(pessoas.length)
  .fill(0)
  .map(x => Array(escolas.length).fill(Infinity));
const calcularDistancia = async (pessoa, escola, callback) => {
  const data = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
      pessoa.lat
    },${pessoa.lng}&destinations=${escola.lat},${escola.lng}${
      pessoa.locomotion ? "&mode=" + pessoa.locomotion : ""
    }&key=AIzaSyBcMFCfbdJdD3__pdiZWMU9Ab5PS2N-pYo`
  ).then(res => res.text());

  await callback(JSON.parse(data).rows[0].elements[0].distance.value);
};
const salvarDistancia = async (p, e, callback) => {
  Promise.all(
    p.map(async (pessoa, i) =>
      Promise.all(
        e.map(async (escola, j) => {
          const data = await Distance.filter({
            userId: pessoa.id,
            localId: escola.id
          }).run();
          if (data && data[0] && data[0].distance) {
            distancias[i][j] = data[0].distance ^ 2;
            return true;
          } else {
            console.log("not ok");
            await calcularDistancia(pessoa, escola, async distance => {
              distancias[i][j] = distance ^ 2;
              console.log({
                userId: pessoa.id,
                localId: escola.id,
                distance
              });
              await Distance.save({
                userId: pessoa.id,
                localId: escola.id
              });
              console.log("now ok");
              return true;
            });
          }
        })
      )
    )
  ).then(() => initiateGa(callback));
};
const generatePersonSchool = array => {
  let numero = Math.floor(Math.random() * array.length);
  return array[numero];
};
const generateRandomCombination = () => {
  let pessoasCopy = [...pessoas].map((item, indice) =>
    Object.assign({}, item, { indice })
  );
  let escolasCopy = [...escolas].map((item, indice) =>
    Object.assign({}, item, { indice })
  );
  return [
    ...pessoas.map(item => {
      let pessoa = generatePersonSchool(pessoasCopy).indice;
      let escola = generatePersonSchool(escolasCopy).indice;
      pessoasCopy = pessoasCopy.filter(item => item.indice !== pessoa);
      escolasCopy = escolasCopy
        .map(item => {
          if (item.indice === escola) {
            return Object.assign({}, item, { capacity: item.capacity - 1 });
          } else return item;
        })
        .filter(item => item.capacity > 0);
      return {
        pessoa: pessoa,
        escola: escola
      };
    })
  ];
};
var config = {
  elitist: options.elitismo,
  fitness: individual => {
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
  iterations: options.interacoes,
  stop: fitness => {
    return false;
  },
  stats: (fitnesses, best) => {
    // console.log(
    //   "Fitnesses of current generation: " +
    //     10000000 / fitnesses.reduce((prev, item) => prev + item) +
    //     "\n"
    // );
  }
};
const crossover = (parent1, parent2) => {
  let capacitys = escolas.map((item, i) => item.capacity);
  const findSchollCapacity = item => {
    if (capacitys[item.escola]) {
      return item;
      capacitys[item.escola] = capacitys[item.escola] - 1;
    } else {
      let newSchool = capacitys.findIndex(i => i > 0);
      capacitys[newSchool] = capacitys[newSchool] - 1;
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
      if (
        distancias[item.pessoa][item.escola] >
        distancias[parent2Copy[i].pessoa][parent2Copy[i].escola]
      )
        return findSchollCapacity(item);
      return findSchollCapacity(parent2Copy[i]);
    });
};
const traduzir = array =>
  array.map(item => {
    return {
      pessoa: pessoas[item.pessoa],
      escola: escolas[item.escola]
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
  const index = vRoullete.findIndex(item => key > item.min && key <= item.max);

  return population[
    index >= 0 ? index : Math.floor(Math.random * population.length)
  ].individual;
};

module.exports = {
  calcularDistancia,
  ga: async callback => {
    pessoas = await User.run();
    escolas = await Local.run();
    distancias = Array(pessoas.length)
      .fill(0)
      .map(x => Array(escolas.length).fill(Infinity));
    myPopulation = myPopulation.map(() => generateRandomCombination());
    salvarDistancia(pessoas, escolas, callback);
  }
};

const initiateGa = callback => {
  ga
    .run({ ...config, population: myPopulation })
    .then(result => {
      callback(
        result.best.individual.map(item => {
          return {
            pessoa: pessoas[item.pessoa],
            escola: escolas[item.escola],
            distance: distancias[item.pessoa][item.escola],
            escolaIndex: item.escola
          };
        })
      );
      console.log("Best individual's fitness: " + result.best.fitness);
      console.log(
        "Best individual: " +
          JSON.stringify(
            result.best.individual.map(item => {
              return {
                pessoa: pessoas[item.pessoa].name,
                escola: escolas[item.escola].name,
                distance: distancias[item.pessoa][item.escola]
              };
            })
          )
      );
    })
    .catch(err => {
      console.log("Oops: " + err);
    });
};
