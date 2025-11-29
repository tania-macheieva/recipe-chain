import React from "react";
import RecipeCard from "./RecipeCard";

const RecipeTree = ({ 
	recipeId, 
	recipes, 
	selectedRecipe, 
	onSelect, 
	onFork, 
	level = 0 
}) => {
	const recipe = recipes.find(r => r.id === recipeId);
	const children = recipes.filter(r => r.parent_id === recipeId);

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
				onSelect={onSelect}
				onFork={onFork}
			/>
			{children.length > 0 && (
				<div className="recipe-tree-children">
					{children.map(child => (
						<RecipeTree
							key={child.id}
							recipeId={child.id}
							recipes={recipes}
							selectedRecipe={selectedRecipe}
							onSelect={onSelect}
							onFork={onFork}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default RecipeTree;