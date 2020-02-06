const obval = require('./obval');
const models = require('mlar')('models');
const q = require('q');

function getInitState(modelName, sourceId) {
  // modelName could be stuff like "collection";
  let table = '';
  let sourceColumnName = '';
  switch (modelName.toLowerCase()) {
    case 'collections':
      table = 'collection_init_state';
      sourceColumnName = 'collection_id';
      break;
    default:
      table = 'collection_init_state';
      sourceColumnName = 'collection_id';
      break;
  }
  let data = {
    where: {},
    order: [['id', 'DESC']]
  };
  data.where[sourceColumnName] = sourceId;
  const d = q.defer();

  q.fcall(() => {
    return models[table].findOne(data);
  })
    .then(state => {
      if (!state) d.resolve({});
      d.resolve(JSON.parse(state.state));
    })
    .catch(err => {
      d.reject(err);
    });

  return d.promise;
}

function compileInitState(model) {
  model = JSON.parse(JSON.stringify(model));
  model = obval.exclude(['created_on', 'modified_on', 'createdAt', 'updatedAt', 'deleted_flag']).from(model);
  let init = JSON.stringify(model);
  return init;
}

function storeState(model, modelName, sourceId) {
  let init_state = compileInitState(model);

  // modelName could be stuff like "collection";
  let table = '';
  let sourceColumnName = '';
  switch (modelName.toLowerCase()) {
    case 'collections':
      table = 'collection_init_state';
      sourceColumnName = 'collection_id';
      break;
    default:
      table = 'collection_init_state';
      sourceColumnName = 'collection_id';
      break;
  }

  let data = {};
  data[sourceColumnName] = sourceId;
  data.state = init_state;
  const d = q.defer();

  q.fcall(() => {
    return models[table].create(data);
  })
    .then(state => {
      if (!state) d.resolve('Could not create init statee');
      d.resolve(state);
    })
    .catch(err => {
      d.reject(err);
    });

  return d.promise;
}

module.exports = {
  getInitState,
  storeState
};
