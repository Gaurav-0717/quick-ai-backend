import sql from "../configs/db.js"

export const getUserCreations =async (req, res)=>{
    try{
        const {userId} = req.auth()
        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
        res.json({
            success: true,
            creations
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const getPublishedCreations =async (req, res)=>{
    try{

        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        res.json({
            success: true,
            creations
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const toggleLikeCreation =async (req, res)=>{
    try{
        const {userId} = req.auth()
        const {id} = req.body;

        const [creations] = await sql`SELECT * FROM creations WHERE id = ${id}`;

        if(!creations){
            return res.json({
                success: false,
                message: "Creation not found"
            })
        }

        const currentlikes = creations.likes;
        const userIdStr =userId.toString();
        let updatedLikes;
        let message;

        if(currentlikes.includes(userIdStr)){
            updatedLikes = currentlikes.filter((user)=> user !== userIdStr);
            message = "Like removed";
        }
        else{
            updatedLikes = [...currentlikes, userIdStr];
            message = "Like added";
        }

        const formattedArray = `{${updatedLikes.join(',')}}`

        await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

        res.json({
            success: true,
            message
        })

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const deleteCreation =async (req, res)=>{
    try{
        const {userId} = req.auth()
        const {id} = req.body;
        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}`;
        if(!creation){
            return res.json({
                success: false,
                message: "Creation not found or you don't have permission to delete it"
            })
        }   
        await sql`DELETE FROM creations WHERE id = ${id} AND user_id = ${userId}`;
        res.json({
            success: true,
            message: "Creation deleted successfully"
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}
