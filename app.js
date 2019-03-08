//import express library
import express from 'express'
//import cors to prevent domain from making requests to other domains
import cors from 'cors'
//have app use express middleware
const app = express();
//have app use cors
app.use(cors())
//have app parse incoming requests by default
app.use(express.json())

//setup express storage to have a dynamiacally changing database
app.locals.title = 'Trapper Keeper';
app.locals.notes = [];
app.locals.items = [];

//get request function
app.get('/api/v1/notes', (request, response) => {
  const notes = app.locals.notes;
  const items = app.locals.items;
  //response is a status of 200 'ok' and and a JSON of our notes and items we have in storage
  return response.status(200).json({ notes, items })
});

//post request function
app.post('/api/v1/notes', (request, response) => {
  const { id, title, items } = request.body;
//will return a 422 status code with message if there is no title
  if (!title) {
    return response.status(422).json('No note title provided');
    //otherwise it will push the id and title object into the notes array in storage, and push all it's items into
    //the items array in storage
  } else {
    app.locals.notes.push({ id, title })
    app.locals.items.push(...items)
    //returns response of 201 that it was succesful and the id, title and items that it was originally sent
    return response.status(201).json({ id, title, items });
  }
});

//get request function that takes in a specific id endpoint
app.get('/api/v1/notes/:id', (request, response) => {
  //grabs the id from the url it was sent
  const { id } = request.params;
  //finds the specific note associated with that id and all associated items
  const note = app.locals.notes.find(note => note.id == id);
  const items = app.locals.items.filter(item => item.noteID == id)

  if (note) {
    //if note is found return 200 with note and all items of that note
    return response.status(200).json({ note, items })
  } else {
    //otherwise 404 and that the note with that specific id doesn't exist
    return response.status(404).json('That note does not exist!')
  }
});

//delete request function with specific id endpoit
app.delete('/api/v1/notes/:id', (request, response) => {
  //grabs the id from the url it was sent
  const { id } = request.params;
  //filters out any notes or items that do not have that id associated with them
  const updatedNotes = app.locals.notes.filter(note => note.id != id)
  const updatedItems = app.locals.items.filter(item => item.noteID != id)

  //if the length of notes has changed, that means the note was succesfully deleted
  if (updatedNotes.length !== app.locals.notes.length) {
    app.locals.notes = updatedNotes
    app.locals.items = updatedItems
    //respond with 202 and id of note that was succesfully deleted
    return response.status(202).json(`Note ${id} has been deleted successfully`)
  } else {
    //otherwise nothing was deleted and 404 response of not found and message is returned
    return response.status(404).json('That note does not exist, nothing was deleted')
  }
});

//put request function with specific id endpoint
app.put('/api/v1/notes/:id', (request, response) => {
   //grabs the id from the url it was sent
  const { id } = request.params;
  //destructure title and items from given body
  const { title, items } = request.body
  //find if that note exists
  const note = app.locals.notes.find(note => note.id == id);
  
  if (note) {
    //if note exists, map through all notes and then replace title with new given title at that id
    const updatedNotes = app.locals.notes.map(note => {
      if (note.id == id) {
        note.title = title
      }
      return note
    })
    //set storage of notes to the new updated one
    app.locals.notes = updatedNotes
    //remove any items from storage that contain associated note id 
    const cleanedItems = app.locals.items.filter(item => item.noteID != id)
    //add on all items that were given and set that to the storage of items
    app.locals.items = [...cleanedItems, ...items]
    //return that the note at that id was succesfully updated
    return response.status(202).json(`Note ${id} has been updated`)
  } else {
    //otherwise there is no note at that id and return that it doesn't exist in storage
    return response.status(404).json('That note does not exist, nothing was edited')
  }
});

export default app