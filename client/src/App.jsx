import React, { useState, useEffect } from "react";
import { ChefHat, GitFork, Users, Clock, Plus, X, Edit } from "lucide-react";
import { recipeAPI } from "./api.js";
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
			setFormData({
				title: "",
				description: "",
				ingredients: "",
				instructions: "",
				changes: "",
				author: "CurrentUser",
			});
			setForkParentId(null);
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

	const getChildren = recipeId => {
		return recipes.filter(r => r.parent_id === recipeId);
	};

	const RecipeCard = ({ recipe, isSelected }) => (
		<div
			className={`recipe-card ${isSelected ? "selected" : ""}`}
			onClick={() => setSelectedRecipe(recipe)}
		>
			<div className="card-header">
				<div className="flex-1">
					<h3 className="card-title">
						{recipe.parent_id && (
							<GitFork size={16} style={{ color: "#4b4b4b" }} />
						)}
						{recipe.title}
					</h3>
					<p className="card-description">{recipe.description}</p>
				</div>
				<button
					onClick={e => {
						e.stopPropagation();
						handleFork(recipe.id);
					}}
					className="fork-btn"
					title="Fork this recipe"
				>
					<GitFork size={18} />
				</button>
			</div>
			<div className="card-meta">
				<span className="meta-item">
					<Users size={14} />
					{recipe.author}
				</span>
				<span className="meta-item">
					<GitFork size={14} />
					{recipe.fork_count || 0} forks
				</span>
				<span className="meta-item">
					<Clock size={14} />
					{new Date(recipe.created_at).toLocaleDateString()}
				</span>
			</div>
		</div>
	);

	const RecipeTree = ({ recipeId, level = 0 }) => {
		const recipe = recipes.find(r => r.id === recipeId);
		const children = getChildren(recipeId);

		if (!recipe) return null;

		return (
			<div
				className={`${
					level > 0 ? "recipe-tree-child" : "recipe-tree-root"
				}`}
			>
				<RecipeCard
					recipe={recipe}
					isSelected={selectedRecipe?.id === recipe.id}
				/>
				{children.length > 0 && (
					<div className="recipe-tree-children">
						{children.map(child => (
							<RecipeTree
								key={child.id}
								recipeId={child.id}
								level={level + 1}
							/>
						))}
					</div>
				)}
			</div>
		);
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
							setForkParentId(null);
							setFormData({
								title: "",
								description: "",
								ingredients: "",
								instructions: "",
								changes: "",
								author: "CurrentUser",
							});
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
										/>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="recipe-details-container">
						<div className="recipe-details-block">
							{selectedRecipe ? (
								<>
									<h2 className="details-title">
										{selectedRecipe.title}
									</h2>

									{selectedRecipe.parent_id && (
										<div className="forked-from-info">
											<p className="fork-label">
												Forked from:
											</p>
											<p className="fork-parent-title">
												{
													recipes.find(
														r =>
															r.id ===
															selectedRecipe.parent_id
													)?.title
												}
											</p>
											{selectedRecipe.changes && (
												<>
													<p className="fork-label">
														Changes:
													</p>
													<p className="fork-changes">
														{selectedRecipe.changes}
													</p>
												</>
											)}
										</div>
									)}

									<div className="details-meta-section">
										<p className="details-description">
											{selectedRecipe.description}
										</p>
										<div className="card-meta">
											<span className="meta-item">
												<Users size={14} />
												{selectedRecipe.author}
											</span>
											<span className="meta-item">
												<GitFork size={14} />
												{selectedRecipe.fork_count || 0}
											</span>
										</div>
									</div>

									<div className="details-section">
										<h3 className="section-title">
											Ingredients
										</h3>
										<p className="section-content">
											{selectedRecipe.ingredients}
										</p>
									</div>

									<div className="details-section">
										<h3 className="section-title">
											Instructions
										</h3>
										<p className="section-content">
											{selectedRecipe.instructions}
										</p>
									</div>

									<div className="details-section">
										<h3 className="section-title">
											Recipe Chain
										</h3>
										<div className="chain-list">
											{getRecipeChain(
												selectedRecipe.id
											).map((r, idx) => (
												<div
													key={r.id}
													className="chain-item"
												>
													<span className="chain-index">
														{idx + 1}.
													</span>
													<span
														className={
															r.id ===
															selectedRecipe.id
																? "chain-current"
																: "chain-standard"
														}
													>
														{r.title}
													</span>
												</div>
											))}
										</div>
									</div>

									<div className="details-actions">
										<button
											onClick={() =>
												handleFork(selectedRecipe.id)
											}
											className="fork-button-full"
										>
											<GitFork size={18} />
											Fork This Recipe
										</button>

										<button
											onClick={() =>
												handleEdit(selectedRecipe)
											}
											className="edit-button-full"
										>
											<Edit size={18} />
											Edit Recipe
										</button>

										<button
											onClick={() =>
												handleDelete(selectedRecipe.id)
											}
											className="delete-button-full"
										>
											<X size={18} />
											Delete Recipe
										</button>
									</div>
								</>
							) : (
								<div className="select-message">
									Select a recipe to view details
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{showCreateModal && (
				<div className="modal-overlay">
					<div className="modal-content">
						<div className="modal-header">
							<h2 className="modal-title">
								{forkParentId
									? "Fork Recipe"
									: "Create New Recipe"}
							</h2>
							<button
								onClick={() => setShowCreateModal(false)}
								className="modal-close-btn"
							>
								<X size={24} />
							</button>
						</div>

						{forkParentId && (
							<div className="forked-from-modal">
								<p className="fork-label">
									Forking from:{" "}
									{
										recipes.find(r => r.id === forkParentId)
											?.title
									}
								</p>
							</div>
						)}

						<div className="modal-form-body">
							<div className="modal-form-group">
								<label>Title *</label>
								<input
									type="text"
									value={formData.title}
									onChange={e =>
										setFormData({
											...formData,
											title: e.target.value,
										})
									}
									placeholder="Recipe title"
								/>
							</div>

							<div className="modal-form-group">
								<label>Description</label>
								<input
									type="text"
									value={formData.description}
									onChange={e =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									placeholder="Brief description"
								/>
							</div>

							<div className="modal-form-group">
								<label>Ingredients *</label>
								<textarea
									value={formData.ingredients}
									onChange={e =>
										setFormData({
											...formData,
											ingredients: e.target.value,
										})
									}
									placeholder="List ingredients separated by commas"
								/>
							</div>

							<div className="modal-form-group">
								<label>Instructions *</label>
								<textarea
									value={formData.instructions}
									onChange={e =>
										setFormData({
											...formData,
											instructions: e.target.value,
										})
									}
									placeholder="Step-by-step instructions"
								/>
							</div>

							{forkParentId && (
								<div className="modal-form-group">
									<label>What did you change?</label>
									<textarea
										value={formData.changes}
										onChange={e =>
											setFormData({
												...formData,
												changes: e.target.value,
											})
										}
										placeholder="Describe your modifications..."
									/>
								</div>
							)}

							<div className="modal-actions">
								<button
									onClick={handleCreate}
									className="primary-btn"
								>
									{forkParentId
										? "Create Fork"
										: "Create Recipe"}
								</button>
								<button
									onClick={() => setShowCreateModal(false)}
									className="secondary-btn"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showEditModal && (
				<div className="modal-overlay">
					<div className="modal-content">
						<div className="modal-header">
							<h2 className="modal-title">Edit Recipe</h2>
							<button
								onClick={() => setShowEditModal(false)}
								className="modal-close-btn"
							>
								<X size={24} />
							</button>
						</div>

						<div className="modal-form-body">
							<div className="modal-form-group">
								<label>Title *</label>
								<input
									type="text"
									value={formData.title}
									onChange={e =>
										setFormData({
											...formData,
											title: e.target.value,
										})
									}
									placeholder="Recipe title"
								/>
							</div>

							<div className="modal-form-group">
								<label>Description</label>
								<input
									type="text"
									value={formData.description}
									onChange={e =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									placeholder="Brief description"
								/>
							</div>

							<div className="modal-form-group">
								<label>Ingredients *</label>
								<textarea
									value={formData.ingredients}
									onChange={e =>
										setFormData({
											...formData,
											ingredients: e.target.value,
										})
									}
									placeholder="List ingredients separated by commas"
								/>
							</div>

							<div className="modal-form-group">
								<label>Instructions *</label>
								<textarea
									value={formData.instructions}
									onChange={e =>
										setFormData({
											...formData,
											instructions: e.target.value,
										})
									}
									placeholder="Step-by-step instructions"
								/>
							</div>

							{selectedRecipe?.parent_id && (
								<div className="modal-form-group">
									<label>Changes Made</label>
									<textarea
										value={formData.changes}
										onChange={e =>
											setFormData({
												...formData,
												changes: e.target.value,
											})
										}
										placeholder="Describe your modifications..."
									/>
								</div>
							)}

							<div className="modal-actions">
								<button
									onClick={handleUpdate}
									className="primary-btn"
								>
									Update Recipe
								</button>
								<button
									onClick={() => setShowEditModal(false)}
									className="secondary-btn"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RecipeChainApp;