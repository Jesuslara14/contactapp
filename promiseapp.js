const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));

async function readContactsFile(){
    const data = await fs.readFile('./data/contacts.json', 'utf-8');
    return JSON.parse(data);
}

async function writeContactsFile(contacts){
    await fs.writeFile('./data/contacts.json', JSON.stringify(contacts));
}

async function findContact(id){
    const contacts = await readContactsFile();
    const contact = await contacts.find(contact => contact.id === id);
    const index = contacts.indexOf(contact);
    return {
        contact: contact,
        index: index
    }
}

app.get('/', async (req, res) => {
    try{
        const contacts = await readContactsFile();
        res.render('index', {contacts});
    }catch(error){
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', async (req, res) => {
    try{
        const newContact = {
            name: req.body.name, 
            email: req.body.email, 
            id: Date.now()
        };
        const contacts = await readContactsFile();
        contacts.push(newContact);
        await writeContactsFile(contacts);
        res.redirect('/');
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/edit/:id', async (req, res) => {
    try{
        const contactFound = await findContact(parseInt(req.params.id));
        const contact = contactFound.contact;
        res.render('edit', {contact});
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/edit/:id', async (req, res) => {
    try{
        const contact = await findContact(parseInt(req.params.id));
        const contacts = await readContactsFile();
        contacts[contact.index] = {
            name: req.body.name, 
            email: req.body.email, 
            id: req.params.id
        };
        await writeContactsFile(contacts);
        res.redirect('/');
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/delete/:id', async (req, res) => {
    try{
        const contact = await findContact(parseInt(req.params.id));
        const contacts = await readContactsFile();
        contacts.splice(contact.index, 1);
        await writeContactsFile(contacts);
        res.redirect('/');
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/view/:id', async (req, res) => {
    try{
        const contactFound = await findContact(parseInt(req.params.id));
        const contact = contactFound.contact;
        res.render('view', {contact});
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, ()=>{
    console.log(`Server now running at ${PORT}`);
});
