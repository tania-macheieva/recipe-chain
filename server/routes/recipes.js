const express = require('express');
const RecipeController = require('../controllers/RecipeController');

const router = express.Router();

router.get('/', RecipeController.getAllRecipes);
router.get('/:id', RecipeController.getRecipeById);
router.post('/', RecipeController.createRecipe);
router.put('/:id', RecipeController.updateRecipe);
router.delete('/:id', RecipeController.deleteRecipe);

router.post('/:id/fork', RecipeController.forkRecipe);
router.get('/:id/chain', RecipeController.getRecipeChain);
router.get('/:id/children', RecipeController.getRecipeChildren);
router.get('/:id/tree', RecipeController.getRecipeTree);

module.exports = router;