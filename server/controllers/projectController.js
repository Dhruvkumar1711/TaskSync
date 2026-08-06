 const db = require('../models/connection');

const createProject = async (req, res) => {
    const { name, description } = req.body;
     const userId = req.user.id;
     const client = await db.client();

     try {
       await client.query('BEGIN');

       const projectQuery = `
         INSERT INTO projects (name, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING *
       `;


       const projectResult = await client.query(
         projectQuery,
         [name, description, userId]
       );
       const project = projectResult.rows[0];

       await client.query(
         'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
         [project.id, userId, 'admin']
       );

       await client.query('COMMIT');
       res.status(201).json(project);
     } catch (err) {
       await client.query('ROLLBACK');
       res.status(500).json({ error: 'Failed to create project' });
     } finally {
       client.release();
     }
}

const getProjects= async (req, res)=> {
     const userId = req.user.id;
    
     const getProjectQuery = `
        SELECT projects.* FROM projects
        JOIN project_members ON projects.id = project_members.project_id
        WHERE project_members.user_id = $1
      `;

     try {

       const result = await db.query(
         getProjectQuery,
         [userId]
       );


       res.json({
        status: "Success",
        data: result.rows
       });


     } catch (err) {
       res.status(500).json({
        status: 'Failed',
         error: 'Failed to fetch projects' 
        });
     }
    
    }


const inviteUser = async (req, res)=> {
     const projectId = req.params.id;
     const { email } = req.body;

     const inviteUserQuery = `
        SELECT id FROM userdetails 
        WHERE email = $1
     `;

     try {
       const userResult = await db.query(inviteUserQuery, [email]);
       
       if (userResult.rows.length === 0) {
         return res.status(404).json({ error: 'User not found' });
       }
       const invitedUserId = userResult.rows[0].id;

       await db.query(
         'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
         [projectId, invitedUserId, 'member']
       );


       res.status(201).json({
        status :"Success",
         message: 'User invited' 
        });


     } catch (err) {
       res.status(500).json({ 
        status: 'failed',
        error: 'Failed to invite user' 
        });
     }
   }

module.exports = { createProject, getProjects, inviteUser };
