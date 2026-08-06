 const db = require('../models/connection');

const isProjectMember = async (req, res, next) => {
    const projectId = req.params.id;
    const userId = req.user.id;

    const checkMembershipQuery = `
        SELECT * FROM project_members 
        WHERE project_id = $1 AND user_id = $2
    `;

    try {
       const result = await db.query(
         checkMembershipQuery,
         [projectId, userId]
   );
    if (result.rows.length === 0) {
         return res.status(403).json({
             error: 'You are not a member of this project'
        });
    }
    next();
    } catch (err) {
       res.status(500).json({ 
        error: 'Something went wrong checking project access' 
        });
    }
};

const isProjectAdmin = async (req, res, next) => {
    const projectId = req.params.id;
     const userId = req.user.id;

     const checkAdminQuery = `
        SELECT * FROM project_members
        WHERE project_id = $1 AND user_id = $2 AND role = 'admin'
     `;

    try {
       const result = await db.query(
         checkAdminQuery,
         [projectId, userId]
       );
       if (result.rows.length === 0) {
         return res.status(403).json({
             error: 'Admin access required for this project' });
       }
       next();
     } catch (err) {
       res.status(500).json({ 
        error: 'Something went wrong checking project access' 
    });
     }
}

module.exports={isProjectMember, isProjectAdmin};