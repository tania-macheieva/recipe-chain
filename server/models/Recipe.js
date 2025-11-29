const pool = require('../config/db');

class Recipe {
  static async findAll() {
    const query = `
      SELECT 
        r.*,
        p.title as parent_title,
        (SELECT COUNT(*) FROM recipes WHERE parent_id = r.id) as fork_count
      FROM recipes r
      LEFT JOIN recipes p ON r.parent_id = p.id
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        r.*,
        p.title as parent_title,
        (SELECT COUNT(*) FROM recipes WHERE parent_id = r.id) as fork_count
      FROM recipes r
      LEFT JOIN recipes p ON r.parent_id = p.id
      WHERE r.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(data) {
    const query = `
      INSERT INTO recipes 
        (title, description, ingredients, instructions, parent_id, author, changes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      data.title,
      data.description,
      data.ingredients,
      data.instructions,
      data.parent_id || null,
      data.author || 'Anonymous',
      data.changes || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getChain(id) {
    const query = `
      WITH RECURSIVE recipe_chain AS (
        SELECT id, title, parent_id, 1 as level
        FROM recipes
        WHERE id = $1
        
        UNION ALL
        
        SELECT r.id, r.title, r.parent_id, rc.level + 1
        FROM recipes r
        INNER JOIN recipe_chain rc ON r.id = rc.parent_id
      )
      SELECT * FROM recipe_chain
      ORDER BY level DESC
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows;
  }

  static async getChildren(id) {
    const query = `
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM recipes WHERE parent_id = r.id) as fork_count
      FROM recipes r
      WHERE r.parent_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows;
  }

  static async getTree(rootId) {
    const query = `
      WITH RECURSIVE recipe_tree AS (
        SELECT id, title, parent_id, ingredients, author, 0 as depth
        FROM recipes
        WHERE id = $1
        
        UNION ALL
        
        SELECT r.id, r.title, r.parent_id, r.ingredients, r.author, rt.depth + 1
        FROM recipes r
        INNER JOIN recipe_tree rt ON r.parent_id = rt.id
      )
      SELECT * FROM recipe_tree
      ORDER BY depth, id
    `;
    
    const result = await pool.query(query, [rootId]);
    return result.rows;
  }

  static async update(id, data) {
    const query = `
      UPDATE recipes
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        ingredients = COALESCE($3, ingredients),
        instructions = COALESCE($4, instructions),
        changes = COALESCE($5, changes)
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [
      data.title,
      data.description,
      data.ingredients,
      data.instructions,
      data.changes,
      id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const checkQuery = 'SELECT COUNT(*) FROM recipes WHERE parent_id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete recipe with existing forks');
    }
    
    const query = 'DELETE FROM recipes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Recipe;