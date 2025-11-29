import React, { useState, useEffect } from "react";
import { ChefHat, Plus } from "lucide-react";
import { recipeAPI } from "./api.js";
import RecipeTree from "./components/RecipeTree";
import RecipeModal from "./components/RecipeModal";
import RecipeDetails from "./components/RecipeDetails";
import "./index.css";

const RecipeChainApp = () => {
	const [recipes, setRecipes] = useState([]);
	const [selectedRecipe, setSelectedRecipe] = useState(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [forkParentId, setForkParentId] = useState(null);
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		ingredients: "",
		instructions: "",
		changes: "",
		author: "CurrentUser",
	});

	useEffect(() => {
		loadRecipes();
	}, []);

	const loadRecipes = async () => {
		setLoading(true);
		try {
			const data = await recipeAPI.getAll();
			setRecipes(data);
		} catch (error) {
			console.error("Failed to load recipes:", error);
			alert("Failed to load recipes: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			ingredients: "",
			instructions: "",
			changes: "",
			author: "CurrentUser",
		});
		setForkParentId(null);
	};

	const handleCreate = async () => {
		if (
			!formData.title ||
			!formData.ingredients ||
			!formData.instructions
		) {
			alert("Please fill all required fields");
			return;
		}

		try {
			if (forkParentId) {
				await recipeAPI.fork(forkParentId, formData);
			} else {
				await recipeAPI.create(formData);
			}

			await loadRecipes();
			setShowCreateModal(false);
			resetForm();
		} catch (error) {
			console.error("Failed to create recipe:", error);
			alert("Failed to create recipe: " + error.message);
		}
	};

	const handleFork = recipeId => {
		const parent = recipes.find(r => r.id === recipeId);
		setForkParentId(recipeId);
		setFormData({
			title: `${parent.title} (Fork)`,
			description: parent.description,
			ingredients: parent.ingredients,
			instructions: parent.instructions,
			changes: "",
			author: "CurrentUser",
		});
		setShowCreateModal(true);
	};

	const handleEdit = recipe => {
		setFormData({
			title: recipe.title,
			description: recipe.description,
			ingredients: recipe.ingredients,
			instructions: recipe.instructions,
			changes: recipe.changes || "",
			author: recipe.author,
		});
		setShowEditModal(true);
	};

	const handleUpdate = async () => {
		if (
			!formData.title ||
			!formData.ingredients ||
			!formData.instructions
		) {
			alert("Please fill all required fields");
			return;
		}

		try {
			await recipeAPI.update(selectedRecipe.id, formData);
			await loadRecipes();
			setShowEditModal(false);
			const updatedRecipe = await recipeAPI.getById(selectedRecipe.id);
			setSelectedRecipe(updatedRecipe);
		} catch (error) {
			console.error("Failed to update recipe:", error);
			alert("Failed to update recipe: " + error.message);
		}
	};

	const handleDelete = async recipeId => {
		if (
			!window.confirm(
				"Are you sure you want to delete this recipe? This action cannot be undone."
			)
		) {
			return;
		}
		try {
			await recipeAPI.delete(recipeId);
			setSelectedRecipe(null);
			await loadRecipes();
		} catch (error) {
			console.error("Failed to delete recipe:", error);
			alert("Failed to delete recipe: " + error.message);
		}
	};

	const getRecipeChain = recipeId => {
		const chain = [];
		let current = recipes.find(r => r.id === recipeId);

		while (current) {
			chain.unshift(current);
			current = recipes.find(r => r.id === current.parent_id);
		}

		return chain;
	};

	const rootRecipes = recipes.filter(r => !r.parent_id);

	return (
		<div className="app-container">
			<div className="main-content">
				<div className="app-header">
					<div className="header-info">
						<ChefHat size={32} style={{ color: "#4b4b4b" }} />
						<div>
							<h1 className="header-title">Recipe Chain</h1>
							<p className="header-subtitle">
								Fork, modify, and track recipe variations
							</p>
						</div>
					</div>
					<button
						onClick={() => {
							resetForm();
							setShowCreateModal(true);
						}}
						className="new-recipe-btn"
					>
						<Plus size={20} />
						New Recipe
					</button>
				</div>

				<div className="main-grid">
					<div className="recipe-list-container">
						<div className="recipe-list-block">
							<h2 className="block-title">Recipe Trees</h2>
							{loading ? (
								<div className="loading-message">
									Loading recipes...
								</div>
							) : rootRecipes.length === 0 ? (
								<div className="loading-message">
									No recipes yet. Create one!
								</div>
							) : (
								<div className="recipe-tree-list">
									{rootRecipes.map(recipe => (
										<RecipeTree
											key={recipe.id}
											recipeId={recipe.id}
											recipes={recipes}
											selectedRecipe={selectedRecipe}
											onSelect={setSelectedRecipe}
											onFork={handleFork}
										/>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="recipe-details-container">
						<div className="recipe-details-block">
							<RecipeDetails
								recipe={selectedRecipe}
								recipes={recipes}
								onFork={handleFork}
								onEdit={handleEdit}
								onDelete={handleDelete}
								getRecipeChain={getRecipeChain}
							/>
						</div>
					</div>
				</div>
			</div>

			<RecipeModal
				show={showCreateModal}
				onClose={() => {
					setShowCreateModal(false);
					resetForm();
				}}
				onSubmit={handleCreate}
				formData={formData}
				setFormData={setFormData}
				forkParentTitle={
					forkParentId
						? recipes.find(r => r.id === forkParentId)?.title
						: null
				}
				showChanges={!!forkParentId}
			/>

			<RecipeModal
				show={showEditModal}
				onClose={() => setShowEditModal(false)}
				onSubmit={handleUpdate}
				formData={formData}
				setFormData={setFormData}
				isEdit={true}
				showChanges={!!selectedRecipe?.parent_id}
			/>
		</div>
	);
};

export default RecipeChainApp;