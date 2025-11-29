const Recipe = require("../models/Recipe");

class RecipeController {
	static async getAllRecipes(req, res) {
		try {
			const recipes = await Recipe.findAll();
			res.json({
				success: true,
				data: recipes,
			});
		} catch (error) {
			console.error("Error fetching recipes:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch recipes",
				error: error.message,
			});
		}
	}

	static async getRecipeById(req, res) {
		try {
			const { id } = req.params;
			const recipe = await Recipe.findById(id);

			if (!recipe) {
				return res.status(404).json({
					success: false,
					message: "Recipe not found",
				});
			}

			res.json({
				success: true,
				data: recipe,
			});
		} catch (error) {
			console.error("Error fetching recipe:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch recipe",
				error: error.message,
			});
		}
	}

	static async createRecipe(req, res) {
		try {
			const {
				title,
				description,
				ingredients,
				instructions,
				parent_id,
				author,
				changes,
			} = req.body;

			if (!title || !ingredients || !instructions) {
				return res.status(400).json({
					success: false,
					message:
						"Title, ingredients, and instructions are required",
				});
			}

			if (parent_id) {
				const parentRecipe = await Recipe.findById(parent_id);
				if (!parentRecipe) {
					return res.status(404).json({
						success: false,
						message: "Parent recipe not found",
					});
				}
			}

			const newRecipe = await Recipe.create({
				title,
				description,
				ingredients,
				instructions,
				parent_id,
				author,
				changes,
			});

			res.status(201).json({
				success: true,
				data: newRecipe,
				message: parent_id
					? "Recipe forked successfully"
					: "Recipe created successfully",
			});
		} catch (error) {
			console.error("Error creating recipe:", error);
			res.status(500).json({
				success: false,
				message: "Failed to create recipe",
				error: error.message,
			});
		}
	}

	static async forkRecipe(req, res) {
		try {
			const { id } = req.params;
			const {
				title,
				description,
				ingredients,
				instructions,
				author,
				changes,
			} = req.body;

			const originalRecipe = await Recipe.findById(id);
			if (!originalRecipe) {
				return res.status(404).json({
					success: false,
					message: "Original recipe not found",
				});
			}

			const forkedRecipe = await Recipe.create({
				title: title || `${originalRecipe.title} (Fork)`,
				description: description || originalRecipe.description,
				ingredients: ingredients || originalRecipe.ingredients,
				instructions: instructions || originalRecipe.instructions,
				parent_id: id,
				author,
				changes,
			});

			res.status(201).json({
				success: true,
				data: forkedRecipe,
				message: "Recipe forked successfully",
			});
		} catch (error) {
			console.error("Error forking recipe:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fork recipe",
				error: error.message,
			});
		}
	}

	static async getRecipeChain(req, res) {
		try {
			const { id } = req.params;

			const recipe = await Recipe.findById(id);
			if (!recipe) {
				return res.status(404).json({
					success: false,
					message: "Recipe not found",
				});
			}

			const chain = await Recipe.getChain(id);

			res.json({
				success: true,
				data: chain,
			});
		} catch (error) {
			console.error("Error fetching recipe chain:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch recipe chain",
				error: error.message,
			});
		}
	}

	static async getRecipeChildren(req, res) {
		try {
			const { id } = req.params;

			const recipe = await Recipe.findById(id);
			if (!recipe) {
				return res.status(404).json({
					success: false,
					message: "Recipe not found",
				});
			}

			const children = await Recipe.getChildren(id);

			res.json({
				success: true,
				data: children,
			});
		} catch (error) {
			console.error("Error fetching recipe children:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch recipe forks",
				error: error.message,
			});
		}
	}

	static async getRecipeTree(req, res) {
		try {
			const { id } = req.params;

			const recipe = await Recipe.findById(id);
			if (!recipe) {
				return res.status(404).json({
					success: false,
					message: "Recipe not found",
				});
			}

			const tree = await Recipe.getTree(id);

			res.json({
				success: true,
				data: tree,
			});
		} catch (error) {
			console.error("Error fetching recipe tree:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch recipe tree",
				error: error.message,
			});
		}
	}

	static async updateRecipe(req, res) {
		try {
			const { id } = req.params;
			const updateData = req.body;

			const recipe = await Recipe.findById(id);
			if (!recipe) {
				return res.status(404).json({
					success: false,
					message: "Recipe not found",
				});
			}

			const updatedRecipe = await Recipe.update(id, updateData);

			res.json({
				success: true,
				data: updatedRecipe,
				message: "Recipe updated successfully",
			});
		} catch (error) {
			console.error("Error updating recipe:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update recipe",
				error: error.message,
			});
		}
	}

	static async deleteRecipe(req, res) {
		try {
			const { id } = req.params;

			const recipe = await Recipe.findById(id);
			if (!recipe) {
				return res.status(404).json({
					success: false,
					message: "Recipe not found",
				});
			}

			await Recipe.delete(id);

			res.json({
				success: true,
				message: "Recipe deleted successfully",
			});
		} catch (error) {
			if (error.message === "Cannot delete recipe with existing forks") {
				return res.status(400).json({
					success: false,
					message: error.message,
				});
			}

			console.error("Error deleting recipe:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete recipe",
				error: error.message,
			});
		}
	}
}

module.exports = RecipeController;
