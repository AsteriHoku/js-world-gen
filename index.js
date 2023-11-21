const express = require('express');
const app = express();

app.use(express.static('static'));
app.set('view engine', 'ejs');

app.use((req,res,next) => {
	res.locals.title = 'JS World Generator';

	next();
});

app.get('/', (req, res) => {
	res.render('index');
});

app.listen(process.env.PORT || 3636, () => console.log('Server started - port 3636'));
