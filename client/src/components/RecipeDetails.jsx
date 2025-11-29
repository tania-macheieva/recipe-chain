import React from "react";
import { GitFork, Users, Edit, X } from "lucide-react";

const RecipeDetails = ({
	recipe,
	recipes,
	onFork,
	onEdit,
	onDelete,
	getRecipeChain
}) => {
	if (!recipe) {
		return (
			<div className="select-message">
				Select a recipe to view details
			</div>
		);
	}

	return (
		<>
			<h2 className="details-title">{recipe.title}</h2>

			{recipe.parent_id && (
				<div className="forked-from-info">
					<p className="fork-label">Forked from:</p>
					<p className="fork-parent-title">
						{recipes.find(r => r.id === recipe.parent_id)?.title}
					</p>
					{recipe.changes && (
						<>
							<p className="fork-label">Changes:</p>
							<p className="fork-changes">{recipe.changes}</p>
						</>
					)}
				</div>
			)}

			<div className="details-meta-section">
				<p className="details-description">{recipe.description}</p>
				<div className="card-meta">
					<span className="meta-item">
						<Users size={14} />
						{recipe.author}
					</span>
					<span className="meta-item">
						<GitFork size={14} />
						{recipe.fork_count || 0}
					</span>
				</div>
			</div>

			<div className="details-section">
				<h3 className="section-title">Ingredients</h3>
				<p className="section-content">{recipe.ingredients}</p>
			</div>

			<div className="details-section">
				<h3 className="section-title">Instructions</h3>
				<p className="section-content">{recipe.instructions}</p>
			</div>

			<div className="details-section">
				<h3 className="section-title">Recipe Chain</h3>
				<div className="chain-list">
					{getRecipeChain(recipe.id).map((r, idx) => (
						<div key={r.id} className="chain-item">
							<span className="chain-index">{idx + 1}.</span>
							<span
								className={
									r.id === recipe.id
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
					onClick={() => onFork(recipe.id)}
					className="fork-button-full"
				>
					<GitFork size={18} />
					Fork This Recipe
				</button>

				<button
					onClick={() => onEdit(recipe)}
					className="edit-button-full"
				>
					<Edit size={18} />
					Edit Recipe
				</button>

				<button
					onClick={() => onDelete(recipe.id)}
					className="delete-button-full"
				>
					<X size={18} />
					Delete Recipe
				</button>
			</div>
		</>
	);
};

export default RecipeDetails;