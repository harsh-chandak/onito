const connection = require('../db/mysql')
const csvtojson = require("csvtojson")
const validateSignup = require("../Validators/addMovieValidation")
class MysqlQuery{

    constructor(){

    }

    //Creating tables and populating them with data
    async createAndPopulateTables(req,res){
        try {
            //Movies Table
            await connection.query("SHOW TABLES LIKE 'movies'", async function(err, rows) {  
                if(err){
                    return console.error(err)
                }
                if (rows.length == 0) {
                    // create the users table if it doesn't exist
                const query =   `CREATE TABLE movies (id int(11) NOT NULL AUTO_INCREMENT,
                                tconst varchar(255) DEFAULT NULL,
                                titleType varchar(255) DEFAULT NULL,
                                primaryTitle varchar(255) DEFAULT NULL,
                                runTimeMinutes decimal(10,2) DEFAULT NULL,
                                genres varchar(255) DEFAULT NULL,
                                PRIMARY KEY (id))`
                await connection.query(query,function(error,result){
                    if(error){
                        return console.error(error)
                    }
                })

                }
            });
            const jsonArray = await csvtojson().fromFile('movies.csv');
            for(let i=0;i<jsonArray.length;i++){
                await connection.query(`SELECT * FROM movies WHERE tconst='${jsonArray[i].tconst}' AND primaryTitle='${jsonArray[i].primaryTitle}' AND titleType='${jsonArray[i].titleType}'`,async function(error1,result1){
                    if(error1){
                        return console.error(error1)
                    }
                    if(result1.length<=0){
                        await connection.query(`INSERT INTO movies (tconst,titleType,primaryTitle,runtimeMinutes,genres) VALUES (?, ?, ?, ?, ?)`,[jsonArray[i].tconst,jsonArray[i].titleType,jsonArray[i].primaryTitle,jsonArray[i].runtimeMinutes,jsonArray[i].genres],function(error2,result2){
                            if(error2){
                                return console.error(error2)
                            }
                        })
                    }
                })
            }

            //Ratings Table
            await connection.query("SHOW TABLES LIKE 'ratings'", async function(err, rows) {  
                if(err){
                    return console.error(err)
                }
                if (rows.length == 0) {
                    // create the users table if it doesn't exist
                const query =   `CREATE TABLE ratings(
                    id int(11) NOT NULL AUTO_INCREMENT,
                    tconst varchar(255) DEFAULT NULL,
                    numVotes integer(10) DEFAULT NULL,
                    averageRating double(10,2) DEFAULT NULL,
                    moviesId int(10) NOT NULL,
                    FOREIGN KEY (moviesId) REFERENCES movies(id),
                    PRIMARY KEY (id))`
                await connection.query(query,function(error,result){
                    if(error){
                        return console.error(error)
                    }
                })

                }
            });
            const jsonArrayRatings = await csvtojson().fromFile('ratings.csv');
            for(let i=0;i<jsonArrayRatings.length;i++){
                await connection.query(`SELECT * FROM movies WHERE tconst='${jsonArrayRatings[i].tconst}'`,async function(error1,result1){
                    if(error1){
                        return console.error(error1)
                    }
                    if(result1.length){
                        const movieId = result1[0].id
                        await connection.query(`SELECT * FROM ratings WHERE tconst='${jsonArrayRatings[i].tconst}'`,async function(error2,result2){
                            if(error2){
                                return console.error(error2)
                            }
                            if(result2.length<=0){
                                await connection.query(`INSERT INTO ratings (tconst,averageRating,numVotes,moviesId) VALUES(?,?,?,?)`,[jsonArrayRatings[i].tconst,jsonArrayRatings[i].averageRating,jsonArrayRatings[i].numVotes,movieId],function(error3,result3){
                                    if(error3){
                                        return console.error(error3)
                                    }
                                })
                            }
                        })
                    }
                })
            }

            return res.status(200).json({
                "success":true,
                "data":{},
                "message":"Tables populated successfully"
            })

        } catch (err) {
            return res.status(500).json({
                "message":"Something went wrong",
                "data":err,
                "success":false,
            });
        }
    }


    //Getting top 10 Movies with highest run time
    async getHighestRunTimeMovies (req,res){
        try {
            await connection.query(`SELECT tconst,runTimeMinutes,primaryTitle,genres FROM movies ORDER BY runTimeMinutes DESC LIMIT 10`, function(error,result){
                if(error){
                    return console.error(error)
                }
                return res.status(200).json({
                    "message":"Data fetched successfully",
                    "success":true,
                    "data":result
                })
            })
        } catch (err) {
            return res.status(500).json({
                "message":"Something went wrong",
                "data":err,
                "success":false,
            }); 
        }
    }


    //Add new Movie
    async adNewMovie(req,res){
        try {
            const errors = validateSignup(req.body);
            if (errors.error) {
                const data = []
                for (let i = 0 ; i<errors.error.details.length;i++){
                    const message = `${errors.error.details[i].message}`.replace(/\"/g, '')
                    data.push({message:message})
                }
                return res.status(403).json({ success:false,data:data,message:"Validation failed" });
            }
            else {
                let count =0
                const payload = req.body
                const countQuery = connection.query(`SELECT COUNT(*) AS count FROM movies`, await function (error, result) {
                    if (error)return console.error(error);
                    count = result[0].count
                    let tconst = `tt0000${count + 2}`;
                
                if (count > 100) {
                    console.log('yes')
                    tconst = `tt0000${count + 2}`;
                }
                if (count > 1000) {
                    console.log('yes4')
                    tconst = `tt000${count + 2}`;
                }
                connection.query(
                `INSERT INTO movies(tconst,titleType,primaryTitle,runtimeMinutes,genres) VALUES (?, ?, ?, ?, ?)`,
                [
                    tconst,
                    req.body.titleType,
                    req.body.primaryTitle,
                    req.body.runtimeMinutes,
                    req.body.genres,
                ],
                async function (error, result) {
                    if (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        message: "Something went wrong while adding the movie",
                        data: error,
                    });
                    }
                    const id = result.insertId;
                    await connection.query(
                    `INSERT INTO ratings(tconst,numVotes,averageRating,moviesId) VALUES (?,?,?,?)`,
                    [tconst, req.body.numVotes, req.body.averageRating, id],
                    function (error1, results) {
                        if (error1) {
                        console.error(error1);
                        return res.status(500).json({
                            success: false,
                            message: "Something went wrong while adding the movie ratings",
                            data: error1,
                        });
                        }
                        return res.status(200).json({
                        success: true,
                        message: "Movie added successfully",
                        data: {},
                        });
                    }
                    );
                }
                );
                });
            }
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err,
            message: "Something went wrong",
          });
        }
    };


    //Get Top Rated Movie
    async getTopRatedMovie(req,res){
        try {
            connection.query(`SELECT movies.tconst, movies.primaryTitle, movies.genres, AVG(ratings.averageRating) as averageRating
            FROM movies
            JOIN ratings ON movies.id = ratings.moviesId
            GROUP BY movies.id
            HAVING averageRating > 6
            ORDER BY averageRating DESC`,function(error,result){
                if(error)console.error(error)
                return res.status(200).json({
                    message:"Movies with average rating > 6",
                    data:result,
                    success:true
                })
            })
        } catch (err) {
            return res.status(500).json({
                message:"Something went wrong",
                data:err,
                success:false
            })
        }
    }
      

    //Get Movies By Genres Sub-Total
    async getMoviesByGenresSubTotal(req,res){
        try {
            connection.query(`
            SELECT movies.genres, movies.primaryTitle, ratings.numVotes, subtotals.totalNumVotes AS TOTAL
            FROM movies 
            JOIN ratings ON movies.id = ratings.moviesId 
            JOIN (SELECT movies.genres, SUM(ratings.numVotes) as totalNumVotes FROM movies JOIN ratings ON movies.id = ratings.moviesId 
            GROUP BY movies.genres) subtotals 
            ON movies.genres = subtotals.genres 
            ORDER BY movies.genres;
            `,function(error,result){
                if(error)console.error(error)
                return res.status(200).json({
                    success:true,
                    data:result,
                    message:"Genre wise numVotes Sub-total fetched successfully"
                })
            })
            
        } catch (err) {
            return res.status(500).json({
                message:"Something went wrong",
                data:err,
                success:false
            })
        }
    }
     
    
    //Update Run time minutes
    async updateRunTimeMinutes(req,res){
        try {
            connection.query(`
                UPDATE movies
                SET runtimeMinutes = 
                CASE 
                WHEN genres = 'Documentary' THEN runtimeMinutes + 15
                WHEN genres = 'Animation' THEN runtimeMinutes + 30
                ELSE runtimeMinutes + 45
                END
            `,function(error,result){
                if(error)console.error(error)
                return res.status(200).json({
                    success:true,
                    data:{},
                    message:"Run time updated successfully"
                })
            })
        } catch (err) {
            return res.status(500).json({
                success:false,
                data:(err).stack,
                message:"Something Went wrong"
            })
        }
    }

}



module.exports = new MysqlQuery()