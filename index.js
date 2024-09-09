import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from 'pg';

const app = express();
const port = 3000;

const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"cocktails",
  password:"Hgaidep62!",
  port:5432,
});

db.connect();


//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());

//set up route to get the random cocktail data
app.get("/", async (req, res) => {
    try {
      const response = await axios.get("https://www.thecocktaildb.com/api/json/v1/1/random.php");
      const cocktail = response.data.drinks[0];
      console.log(cocktail);
      res.render("index.ejs", {
        cocktail
      });
    } catch (error) {
      console.error("Failed to make request:", error.message);
      res.render("index.ejs", {
        error: error.message,
      })
    }
});

//route to handle saving cocktails
app.post('/save-cocktail', async (req, res) => {
  const { name, image_url, instructions, ingredients } = req.body;
  try {
      //fetch the cocktail data and insert into database
      await db.query(
          'INSERT INTO cocktails (name, image_url, instructions, ingredients) VALUES ($1, $2, $3, $4)',
          [name, image_url, instructions, ingredients]
      );
      res.sendStatus(200); // Respond with success status
  } catch (error) {
      console.error('Error saving cocktail:', error.message);
      res.sendStatus(500); // Respond with error status
  }
});

//route to render the saved cocktails onto the favorites page
app.get('/favorites', async (req, res) => {
  try {
      const result = await db.query('SELECT * FROM cocktails');
      const cocktails = result.rows;
      res.render('favorites.ejs', { cocktails });
  } catch (error) {
      console.error('Error fetching favorites:', error.message);
      res.status(500).send('Error fetching favorites');
  }
});

//route to handle requests for individual cocktail details from database
app.get('/cocktail/:id', async (req, res) => {
  const cocktailId = req.params.id;
  try {
      const result = await db.query('SELECT * FROM cocktails WHERE id = $1', [cocktailId]);
      const cocktail = result.rows[0];
      if (cocktail) {
          res.render('cocktail-details.ejs', { cocktail });
      } else {
          res.status(404).send('Cocktail not found');
      }
  } catch (error) {
      console.error('Error fetching cocktail details:', error.message);
      res.status(500).send('Error fetching cocktail details');
  }

  console.log('Fetching cocktail with ID:', cocktailId);
});

//route to handle deleting a cocktail
app.post('/delete-cocktail/:id', async (req, res) => {
  const cocktailId = req.params.id;

  try {
      // delete the cocktail from the database
      await db.query('DELETE FROM cocktails WHERE id = $1', [cocktailId]);
      res.redirect('/favorites'); // redirect back to the favorites page
  } catch (error) {
      console.error('Error deleting cocktail:', error.message);
      res.status(500).send('Error deleting cocktail');
  }
});

//route to get cocktails by ingredient
app.get('/ingredient/:ingredient', async (req, res) => {
  const ingredient = req.params.ingredient;

  try {
      const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`);
      const cocktails = response.data.drinks;
      res.render('ingredient.ejs', { ingredient, cocktails });
  } catch (error) {
      console.error("Error fetching ingredient:", error.message);
      res.render('ingredient.ejs', { error: error.message });
  }
});

// route to handle requests for individual cocktail details from the API
app.get('/cocktail/api/:id', async (req, res) => {
  const cocktailId = req.params.id;
  try {
      const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`);
      const cocktail = response.data.drinks[0];
      console.log('API Cocktail Data:', cocktail); // Log to check data

      if (cocktail) {
          // Format ingredients as an array
          cocktail.ingredients = [];
          for (let i = 1; i <= 15; i++) {
              if (cocktail[`strIngredient${i}`]) {
                  cocktail.ingredients.push(`${cocktail[`strIngredient${i}`]} - ${cocktail[`strMeasure${i}`] || ''}`);
              }
          }
          res.render('api-cocktail-details.ejs', { cocktail });
      } else {
          res.status(404).send('Cocktail not found in the API');
      }
  } catch (error) {
      console.error('Error fetching cocktail details from API:', error.message);
      res.status(500).send('Error fetching cocktail details from API');
  }
});



app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

