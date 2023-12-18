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
let persons= [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get('/info', (request, response) => {
  let cuantity=persons.length;
  const info = `<p>phonebook has info for ${cuantity} people</p><p>${ new Date()}</p>`;
  
  response.end(info)
})

  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
 
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const personToRemove = persons.find(person => person.id === id);

  if (personToRemove) {
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

const generateId = () => {
   const random_id = Math.floor(Math.random() * 1001);
  return random_id;
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({error: 'content missing'})
  }
  const personToRemove = persons.find(person => person.name === body.name);
if(personToRemove){
  return response.status(409).json({ error: 'name must be unique' })
  
}else {
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
}

})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
