import React from "react";
import { GitFork, Users, Clock } from "lucide-react";

const RecipeCard = ({ recipe, isSelected, onSelect, onFork }) => (
	<div
		className={`recipe-card ${isSelected ? "selected" : ""}`}
		onClick={() => onSelect(recipe)}
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
					onFork(recipe.id);
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

export default RecipeCard;