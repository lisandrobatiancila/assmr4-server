const DataStore = require('nedb')


module.exports = {
    DBLISTS: function(id){
        const lists = [
            {id: 1, name: new DataStore({filename: './database/accounts.db'})},
            {id: 2, name: new DataStore({filename: './database/users.db'})},
        ]

        return lists[id]
    },
    isUserExists(email){
        return new Promise((resolve, reject) => {
            try{
                const dbPicked = this.DBLISTS(0)

                const accountDS = dbPicked.name
                accountDS.loadDatabase()
                accountDS.findOne({email}, function(err, user){
                    if(err)
                        reject(err)
                    resolve(user?true:false)
                })
            }
            catch(err){
                reject(err)
            }
        })
    },
    userID: function(refToken){
        const ID = new Promise((resolve, reject) => {
            const dbPicked = this.DBLISTS(0)
            const accountDS = dbPicked.name

            accountDS.loadDatabase()
            accountDS.findOne({'cred.refreshToken': refToken}, {user_id: 1}, function(err, user){
                if(err)
                    reject(err)
                resolve(user)
            })
        })
        return ID
    }
}