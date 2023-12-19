require('dotenv').config()
const express = require('express');
const app = express();
app.use(express.static('build'))


const cors = require('cors');
app.use(cors());

const morgan = require('morgan');
app.use(morgan('tiny'));

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    req.method === 'POST' ? JSON.stringify(req.body) : '' // Mostrar el cuerpo solo para POST
  ].join(' ');
}));

app.use(express.json())


const persons = require('./models/persons')

app.get('/info', (request, response) => {
  let cuantity=persons.length;
  const info = `<p>phonebook has info for ${cuantity} people</p><p>${ new Date()}</p>`;
  
  response.end(info)
})

  app.get('/api/persons', (request, response) => {
    persons.find({}).then(persons => {
      response.json(persons)
    })
  })

  app.get('/api/persons/:id', (request, response,next) => {
    
    persons.findById(request.params.id).then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
    
  })

app.delete('/api/persons/:id', (request, response, next) => {
  persons.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response,next) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'content missing' })
  } 
  const person = new persons({
      name: body.name,
      number: body.number 
      
    })

  person.save().then(person => {
    response.json(person)
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { number } = request.body;

  persons.findByIdAndUpdate(request.params.id, { number }, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).json({ error: 'ID no encontrado' });
      }
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
