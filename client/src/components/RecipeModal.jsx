import React from "react";
import { X } from "lucide-react";

const RecipeModal = ({
	show,
	onClose,
	onSubmit,
	formData,
	setFormData,
	isEdit = false,
	forkParentTitle = null,
	showChanges = false,
}) => {
	if (!show) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<div className="modal-header">
					<h2 className="modal-title">
						{isEdit
							? "Edit Recipe"
							: forkParentTitle
							? "Fork Recipe"
							: "Create New Recipe"}
					</h2>
					<button onClick={onClose} className="modal-close-btn">
						<X size={24} />
					</button>
				</div>

				{forkParentTitle && (
					<div className="forked-from-modal">
						<p className="fork-label">
							Forking from: {forkParentTitle}
						</p>
					</div>
				)}

				<div className="modal-form-body">
					<div className="modal-form-group">
						<label>Author Name *</label>
						<input
							type="text"
							value={formData.author}
							onChange={e =>
								setFormData({
									...formData,
									author: e.target.value,
								})
							}
							placeholder="Your name or nickname"
						/>
					</div>

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

					{showChanges && (
						<div className="modal-form-group">
							<label>
								{isEdit
									? "Changes Made"
									: "What did you change?"}
							</label>
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
						<button onClick={onSubmit} className="primary-btn">
							{isEdit
								? "Update Recipe"
								: forkParentTitle
								? "Create Fork"
								: "Create Recipe"}
						</button>
						<button onClick={onClose} className="secondary-btn">
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecipeModal;
